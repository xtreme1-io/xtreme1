"""Smoke test for a running xtreme1 docker compose stack (nginx on :8190).

Uploads the trial datasets bundled in the backend image, waits for parsing and
downloads a few files through presigned URLs. Exits non-zero on failure.
"""
import io
import json
import sys
import time
import uuid
import zipfile

import requests

BASE = "http://localhost:8190"
API = BASE + "/api"
s = requests.Session()
plain = requests.Session()
# never route localhost through a system proxy; this is run on developer machines too
s.trust_env = plain.trust_env = False
failures = []


def call(method, path, **kw):
    r = s.request(method, API + path, timeout=120, **kw)
    r.raise_for_status()
    body = r.json()
    if isinstance(body, dict) and body.get("code") not in (None, "OK"):
        raise RuntimeError(f"{path}: {body.get('code')} {body.get('message')}")
    return body.get("data") if isinstance(body, dict) and "data" in body else body


def check(name, ok, detail=""):
    print(f"{'PASS' if ok else 'FAIL'} {name} {detail}", flush=True)
    if not ok:
        failures.append(name)


def upload(dataset_type, zip_path, name):
    ds = call("POST", "/dataset/create", json={"name": f"{name}-{uuid.uuid4().hex[:6]}", "type": dataset_type})
    pre = call("GET", "/data/generatePresignedUrl", params={"fileName": zip_path.split("/")[-1], "datasetId": ds["id"]})
    with open(zip_path, "rb") as f:
        plain.put(pre["presignedUrl"], data=f.read(), timeout=600).raise_for_status()
    serial = call("POST", "/data/upload", json={"fileUrl": pre["accessUrl"], "datasetId": ds["id"], "source": "LOCAL", "dataFormat": "XTREME1"})
    rec = None
    for _ in range(200):
        recs = call("GET", "/data/findUploadRecordBySerialNumbers", params={"serialNumbers": str(serial)})
        rec = recs[0] if recs else None
        if rec and rec.get("status") in ("PARSE_COMPLETED", "FAILED"):
            break
        time.sleep(3)
    return ds["id"], rec


def file_urls(items):
    urls = []
    for d in items:
        for c in d.get("content") or []:
            if (c.get("file") or {}).get("url"):
                urls.append(c["file"]["url"])
            for f in c.get("files") or []:
                if (f.get("file") or {}).get("url"):
                    urls.append(f["file"]["url"])
    return urls


user = f"ci_{uuid.uuid4().hex[:8]}@example.com"
token = call("POST", "/user/register", json={"username": user, "password": "Ci123456789"})["token"]
s.headers["Authorization"] = f"Bearer {token}"
check("register", bool(token))

for dtype, path, expect in [("IMAGE", "samples/xtreme1-image-trial.zip", 12),
                            ("LIDAR_FUSION", "samples/xtreme1-lidar-fusion-trial.zip", 16)]:
    ds, rec = upload(dtype, path, dtype.lower())
    parsed = rec and rec.get("parsedDataNum")
    total = rec and rec.get("totalDataNum")
    check(f"upload {dtype}", rec is not None and rec.get("status") == "PARSE_COMPLETED" and not rec.get("errorMessage"),
          json.dumps({k: rec.get(k) for k in ("status", "parsedDataNum", "totalDataNum", "errorMessage")} if rec else None))
    # PARSE_COMPLETED on its own does not mean everything in the archive came through:
    # both counts have to be the number this sample actually holds.
    check(f"parsed count {dtype}", parsed == total == expect,
          f"parsed={parsed} total={total} expected={expect}")
    items = call("GET", "/data/findByPage", params={"pageNo": 1, "pageSize": 5, "datasetId": ds})["list"]
    urls = file_urls(items)[:4]
    statuses = [plain.get(u, timeout=60).status_code for u in urls]
    check(f"download {dtype}", urls and all(x == 200 for x in statuses), f"{statuses}")

for page in ["/", "/tool/image/", "/tool/pc/", "/tool/text/"]:
    r = plain.get(BASE + page, timeout=30)
    check(f"frontend {page}", r.status_code == 200 and "<html" in r.text.lower(), str(r.status_code))

print("FAILURES:", failures)
sys.exit(1 if failures else 0)
