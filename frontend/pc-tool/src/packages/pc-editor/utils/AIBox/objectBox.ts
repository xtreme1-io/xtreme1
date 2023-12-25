// @ts-nocheck
import { kdTree } from './kdtree';
import nj from './numjs.js';
import d3 from './d3-quadtree@3.js';
function angleNormalize(angle) {
  return angle - Math.floor((angle + Math.PI) / (2 * Math.PI)) * 2 * Math.PI;
}

function range(num) {
  return [...Array(num).keys()];
}

function linespace(start, stop, num) {
  const interval = (stop - start) / (num - 1);
  return range(num).map((i) => start + interval * i);
}

function argmin(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] < r[0] ? a : r))[1];
}

function mean(array) {
  return array.reduce((c, v) => c + v, 0) / array.length;
}

function rotFromAngle(angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const R = nj.array([
    [cos, -sin],
    [sin, cos],
  ]);
  return R;
}

function genRects(points2d, angles, edgeGap = 0.5) {
  //
  //:param points_2d: [N, 2]
  //:param angles: radian
  //

  const N = points2d.shape[0];
  const corners = []; // [A, 4, 2]
  const losses = []; // [A]
  const sizes = []; // [A, 2]
  for (const angle of angles) {
    const R = rotFromAngle(angle);

    const rotated_points = points2d.dot(R);
    const mins = [0, 1].map((i) => rotated_points.pick(null, i).min());
    const maxs = [0, 1].map((i) => rotated_points.pick(null, i).max());
    const boundaries = [...mins, ...maxs];

    const axises = [0, 1, 0, 1];
    const distances = nj.stack(
      boundaries.map((boundary, i) =>
        nj.abs(rotated_points.pick(null, axises[i]).subtract(boundary)),
      ),
      1,
    );

    // const min_distances = nj.array(range(N).map((i) => distances.pick(i).min()));
    const min_indices = range(N).map((i) => argmin(distances.pick(i).tolist()));
    const min_distances = nj.array(min_indices.map((col, row) => distances.get(row, col)));
    // const minLoss = min_distances.mean();
    let _stdLoss = 0.0;
    let validCount = 0;
    for (let i = 0; i < 4; i++) {
      const sideDistances = [];
      for (let row = 0; row < N; row++) {
        if (min_indices[row] == i && min_distances.get(row) < edgeGap) {
          sideDistances.push(min_distances.get(row));
        }
      }
      const count = sideDistances.length;
      if (count > 0) {
        _stdLoss += nj.array(sideDistances).std() * count;
        validCount += count;
      }
    }
    const stdLoss = _stdLoss / validCount;
    // console.log(`loss std: ${stdLoss}, validCount: ${validCount}`);
    const loss = (stdLoss / validCount) * 50;

    const [min_x, min_y, max_x, max_y] = boundaries;
    const size = [max_x - min_x, max_y - min_y];

    const _corners = nj
      .array([
        [min_x, max_y],
        [min_x, min_y],
        [max_x, min_y],
        [max_x, max_y],
      ])
      .dot(R.T);

    corners.push(_corners);
    losses.push(loss);
    sizes.push(size);
  }
  return [nj.stack(corners, 0), losses, sizes];
}

function bestBoundingBox2d(points2d) {
  //
  //:param points_2d: [N, 2]
  //
  function genBoundingBox(angles) {
    const [corner_points, losses, sizes] = genRects(points2d, angles);
    const best_i = argmin(losses);
    return [best_i, sizes, corner_points];
  }

  function newAngles(angles, count, best_i) {
    const start = angles[Math.max(0, best_i - 1)];
    const end = angles[Math.min(angles.length - 1, best_i + 1)];
    return linespace(start, end, count).slice(1, -1);
  }

  // 1. first round, interval: 90 / 9 = 10
  const angles1 = linespace(0, Math.PI / 2, 10);
  const best_i1 = genBoundingBox(angles1)[0];
  // console.log(f"1: {angles[best_i]:.3}, {angles}")

  // 2. second round, interval: 10 * 2 / 10 = 2, include first best
  const angles2 = newAngles(angles1, 11, best_i1);
  const best_i2 = genBoundingBox(angles2)[0];
  // const angles = newAngles(angles1, 11, best_i1);
  // const [best_i, sizes, all_corner_points] = genBoundingBox(angles);

  // 3. third round, interval: 2 * 2 / 8 = 0.5
  const angles = newAngles(angles2, 9, best_i2);
  const [best_i, sizes, all_corner_points] = genBoundingBox(angles);

  const corner_points = all_corner_points.pick(best_i);
  let angle = angles[best_i],
    [dx, dy] = sizes[best_i];
  // print(f"2: {angle:.3}, ({start:.2}, {end:.2}), {angles2}")

  // 3. angle
  if (dx < dy) {
    [dx, dy] = [dy, dx];
    angle = angle < 0 ? angle + Math.PI / 2 : angle - Math.PI / 2;
  }

  const center = range(2).map((i) => corner_points.pick(null, i).mean());
  return [...center, dx, dy, angle];
}

function bestBoundingBox3d(points, headAngle = null) {
  //
  //param points: [N, 3]
  //param headAngle: in radian on xy plane
  //return: [x, y, z, dx, dy, dz, rotZ]
  //
  const box2d = bestBoundingBox2d(points.slice(null, [null, 2]));
  let [x, y, dx, dy, angle] = box2d;

  // flip head
  if (headAngle !== null && Math.abs(angleNormalize(angle - headAngle)) > Math.PI / 2) {
    angle = angle < 0 ? angle + Math.PI : angle - Math.PI;
  }

  const zs = points.pick(null, 2);
  const zMin = zs.min(),
    zMax = zs.max();
  const z = (zMin + zMax) / 2;
  const dz = zMax - zMin;
  return [x, y, z, dx, dy, dz, angle];
}

function distance2dArray(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function distance3d(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function distance3dArray(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function searchRect(quadtree, xmin, ymin, xmax, ymax) {
  const results = [];
  quadtree.visit((node, x1, y1, x2, y2) => {
    if (!node.length) {
      do {
        const d = node.data;
        if (d[0] >= xmin && d[0] < xmax && d[1] >= ymin && d[1] < ymax) {
          results.push(d);
        }
      } while ((node = node.next));
    }
    return x1 >= xmax || y1 >= ymax || x2 < xmin || y2 < ymin;
  });
  return results;
}

function searchBall(octree, x, y, z, radius, { distanceFn = distance3dArray }) {
  const points = [];
  const distances = [];
  const o = [x, y, z];
  const [xmin, ymin, zmin, xmax, ymax, zmax] = [
    x - radius,
    y - radius,
    z - radius,
    x + radius,
    y + radius,
    z + radius,
  ];
  octree.visit(function (node, x1, y1, z1, x2, y2, z2) {
    if (!node.length) {
      do {
        const d = node.data;
        const distance = distanceFn(d, o);
        if (distance < radius) {
          distances.push(distance);
          points.push(d);
        }
      } while ((node = node.next));
    }
    return x1 >= xmax || y1 >= ymax || z1 >= zmax || x2 < xmin || y2 < ymin || z2 < zmin;
  });
  return [points, distances];
}

// cl
const EMPTY = -9;
const NOISE = -1;

function DBScan(pc, { minPts = 3, eps = 0.5 }) {
  // pc: list, [[x, y, z], ...]
  const N = pc.length;
  const labels = Array(N).fill(EMPTY); // -1: noise,
  const clusterCounts = [];

  const tree = new kdTree(
    range(N).map(function (i) {
      const [x, y, z] = pc[i];
      return { x: x, y: y, z: z, idx: i };
    }),
    distance3d,
    ['x', 'y', 'z'],
  );

  if (eps === null) {
    const K = Math.min(N, minPts);
    const distances = nj.array(
      range(N).map(function (i) {
        const [x, y, z] = pc[i];
        return mean(tree.nearest({ x: x, y: y, z: z }, K).map((nb) => nb[1]));
      }),
    );
    eps = Math.max(0.5, distances.mean() + distances.std() * 10);
  }

  let C = -1; // Cluster counter
  range(N).forEach((i) => {
    if (labels[i] != EMPTY) {
      return;
    }

    const [x, y, z] = pc[i];
    const neighbors = tree.nearest({ x: x, y: y, z: z }, null, eps).map((n) => n[0]);
    if (neighbors.length < minPts) {
      labels[i] = NOISE;
      return;
    }

    C += 1;
    clusterCounts.push([]);
    labels[i] = C;
    clusterCounts[C].push(i);

    const seeds = new Set(neighbors.map((p) => p.idx));
    seeds.delete(i);

    while (seeds.size > 0) {
      const coreIdx = seeds.values().next().value;
      seeds.delete(coreIdx);

      // Change Noise to border point
      if (labels[coreIdx] == NOISE) {
        labels[coreIdx] = C;
        clusterCounts[C].push(coreIdx);
      }
      //Previously processed (e.g., border point)
      if (labels[coreIdx] !== EMPTY) {
        continue;
      }

      labels[coreIdx] = C; //Label neighbor
      clusterCounts[C].push(coreIdx);

      const [x, y, z] = pc[coreIdx];
      const neighborIndices = tree.nearest({ x: x, y: y, z: z }, null, eps).map((n) => n[0].idx); //Find neighbors

      if (neighborIndices.length >= minPts) {
        //Density check (if Q is a core point)
        // Add new neighbors to seed set
        neighborIndices.forEach((ni) => {
          if (ni != coreIdx && labels[ni] <= NOISE) {
            seeds.add(ni);
          }
        });
      }
    }
  });
  return [labels, clusterCounts];
}

// function DBScan2(pc, {minPts=3, eps=0.5}) {
//     // pc: list, [[x, y, z], ...]
//     const N = pc.length;
//     const labels = Array(N).fill(EMPTY); // -1: noise,
//     const clusterCounts = [];

//     const points = range(N).map((i) => [...pc[i], i]);

//     tree = d3.octree().addAll(points);

//     var C = -1; // Cluster counter
//     range(N).forEach((i) => {
//         if (labels[i] != EMPTY) {
//             return;
//         }

//         const [x, y, z] = pc[i];
//         const neighbors = searchBall(tree, x, y, z, eps)[0];
//         if (neighbors.length < minPts) {
//             labels[i] = NOISE;
//             return;
//         }

//         C += 1;
//         clusterCounts.push([]);
//         labels[i] = C;
//         clusterCounts[C].push(i);

//         const seeds = new Set(neighbors.map((p) => p[3]));
//         seeds.delete(i);

//         while(seeds.size > 0) {
//             const coreIdx = seeds.values().next().value;
//             seeds.delete(coreIdx);

//             // Change Noise to border point
//             if (labels[coreIdx] == NOISE) {
//                 labels[coreIdx] = C;
//                 clusterCounts[C].push(coreIdx);
//             }
//             //Previously processed (e.g., border point)
//             if (labels[coreIdx] !== EMPTY) {
//                 continue;
//             }

//             labels[coreIdx] = C; //Label neighbor
//             clusterCounts[C].push(coreIdx);

//             const [x, y, z] = pc[coreIdx];
//             //Find neighbors
//             const neighborIndices = searchBall(tree, x, y, z, eps).map((n) => n[3])[0];

//             if (neighborIndices.length >= minPts) {  //Density check (if Q is a core point)
//                 // Add new neighbors to seed set
//                 neighborIndices.forEach((ni) => {
//                     if (ni != coreIdx && (labels[ni] <= NOISE)) {
//                         seeds.add(ni);
//                     }
//                 });
//             }
//         }

//         clusterCounts[C].forEach(function(i) {
//             tree.remove(points[i]);
//         });
//         console.log(`tree size: ${tree.size()}, -${ clusterCounts[C].length}`);
//     });
//     return [labels, clusterCounts];
// }

function d3dForOutlier(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz * 100);
}

function filterOutlier(pcList, { K = 10 }) {
  const start = Date.now();

  const N = pcList.length;
  const tree = new kdTree(
    range(N).map(function (i) {
      const [x, y, z] = pcList[i];
      return { x: x, y: y, z: z, idx: i };
    }),
    d3dForOutlier,
    ['x', 'y', 'z'],
  );

  const distances = nj.array(
    pcList.map((p) => mean(tree.nearest({ x: p[0], y: p[1], z: p[2] }, K).map((nb) => nb[1]))),
  );
  const threshold = distances.mean() + distances.std() * 0;
  const result = pcList.filter((p, i) => distances.get(i) < threshold);

  console.log(
    `filterOutlier(#${pcList.length} => ${result.length}, ${(Date.now() - start) / 1000}s`,
  );
  return result;
}

function primarySubPc(pc, minDistance) {
  const [labels, labelIndices] = DBScan(pc.tolist(), { minPts: 3, eps: minDistance });
  const idx = labelIndices.map((c, i) => [c.length, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];

  const label = labels[labelIndices[idx][0]];
  return nj.stack(
    range(labels.length)
      .filter((i) => labels[i] == label)
      .map((i) => pc.pick(i)),
    0,
  );
}

class ObjectBox {
  pc_source: any;
  break: any;
  frameId: string;
  fullRoad: Uint8Array;
  constructor(pc, { roadPc = null }) {
    //:param pc: 点云数据, numjs array([N, 3])
    //:param roadPc: 路面点云数据, numjs array([M, 3])
    //

    // kdtree
    if (roadPc === null) {
      this.roadFlags = this.extractRoad(pc, { minDistance: 2.0 });
    } else {
      console.log(`road point count: ${roadPc.shape[0]}`);
      roadPc = this.compressRoad(roadPc, 0.5);
      this.roadTree = this.pc2Tree(roadPc.tolist());
      this.roadFlags = null;
    }
    // console.log(`final road point count: ${this.roadTree.size()}`);
  }

  roadPc() {
    return this.roadTree.data();
  }

  pc2Tree(pc) {
    // return new kdTree(
    //     range(pc.shape[0]).map((i) => ({x: pc.get(i, 0), y: pc.get(i, 1), z: pc.get(i, 2), i: i})),
    //     distance2d,
    //     ["x", "y"],
    //     10)

    const tree = d3.quadtree().addAll(pc);
    return tree;
  }

  box3dFromSubpc(
    subpc,
    { headAngle = null, minDistance = 0.5, roadGap = 0.1, minFilterPoints = 100 },
  ) {
    // 从子点云中得到带方向的3d框
    //
    // subpc: 点云被选中的部分，numjs array: [N, 3]
    // headAngle: 头部的参考方向，该方向通过画框的方向得到
    // roadGap: 路面间隙，该参数用于控制路面点云的误差
    // minDistance: 最小距离，大于此距离的点会被看作属于2个不同的点云

    const start = Date.now();

    // box
    const xs = subpc.pick(null, 0);
    const ys = subpc.pick(null, 1);
    const minX = xs.min(),
      maxX = xs.max();
    const minY = ys.min(),
      maxY = ys.max();
    const box2d = [(minX + maxX) / 2, (minY + maxY) / 2, maxX - minX, maxY - minY, 0.0];

    const roadZ = this.maxZFromRoad(box2d) + roadGap;

    const subPcAbove = [];
    for (let i = 0; i < subpc.shape[0]; i++) {
      const p = subpc.pick(i);
      if (p.get(2) >= roadZ) {
        subPcAbove.push(p);
      }
    }

    subpc = nj.stack(subPcAbove, 0);
    const subpcCount = subpc.shape[0];
    if (subpcCount < 10) {
      return null;
    }
    const start2 = Date.now();

    // filter object outliers
    if ((!minFilterPoints || subpcCount > minFilterPoints) && minDistance !== null) {
      subpc = primarySubPc(subpc, minDistance);
      if (subpc === null) {
        console.log('empty point cloud in box');
        return null;
      }
    }

    //
    if (headAngle === null) {
      headAngle = box2d[4];
    }
    const start3 = Date.now();
    const box = bestBoundingBox3d(subpc, headAngle);
    box[2] -= roadGap / 2;
    box[5] += roadGap;
    const start4 = Date.now();

    console.log(
      `box3d(#${subpc.shape[0]}): ${(start4 - start) / 1000}s (subpc: ${
        (start2 - start) / 1000
      }, dbscan: ${(start3 - start2) / 1000}, fit: ${(start4 - start3) / 1000})`,
    );
    return box;
  }

  maxZFromRoad(box2d) {
    const [cx, cy, dx, dy, rot] = box2d;
    const R = rotFromAngle(rot);

    const x2 = dx / 2,
      y2 = dy / 2;
    const x1 = -x2,
      y1 = -y2;
    const points = [
      [x1, y1],
      [x1, y2],
      [x2, y1],
      [x2, y2],
    ].map((p) => R.dot(p).add([cx, cy]).tolist());
    const zs = points.map((p) => this.roadTree.find(p[0], p[1])).map((n) => n[2]);
    const road_z = Math.max(...zs);
    return road_z;
  }
  maxZByPosition(pos) {
    if (!Array.isArray(pos)) {
      pos = [pos];
    }
    const zs = pos.map((p) => this.roadTree.find(p.x, p.y)).map((n) => n[2]);
    return zs;
  }

  compressRoad(pc, minDistance = 1.0) {
    const minX = pc.pick(null, 0).min(),
      maxX = pc.pick(null, 0).max();
    const minY = pc.pick(null, 1).min(),
      maxY = pc.pick(null, 1).max();

    const xs = linespace(minX, maxX, Math.floor((maxX - minX) / minDistance));
    const ys = linespace(minY, maxY, Math.floor((maxY - minY) / minDistance));

    const tree = this.pc2Tree(pc.tolist());
    const road = [];
    const halfDistance = minDistance / 2;
    for (const x of xs) {
      for (const y of ys) {
        const ps = searchRect(
          tree,
          x - halfDistance,
          y - halfDistance,
          x + halfDistance,
          y + halfDistance,
        ).map((n) => n[0]);
        if (ps.length > 0) {
          //选择最高的点
          const p = ps.reduce((c, v) => (c.z < v.z ? v : c), { x: 0, y: 0, z: -1000 });
          road.push([p.x, p.y, p.z]);
        }
      }
    }
    return nj.array(road);
  }

  extractRoad(pc, { minDistance = 1.0, K = 20, maxAngle = 5 }) {
    const start = Date.now();
    const N = pc.shape[0];
    const minX = pc.pick(null, 0).min(),
      maxX = pc.pick(null, 0).max();
    const minY = pc.pick(null, 1).min(),
      maxY = pc.pick(null, 1).max();
    const z = pc.pick(null, 2);
    const meanZ = z.mean();
    const stdZ = z.std();
    const minZ = meanZ - stdZ * 2;
    const maxZ = meanZ + stdZ;
    // console.log(`minZ: ${minZ}  (mean:${z.mean()}, std: ${z.std()})`);

    const xs = linespace(minX, maxX, Math.floor((maxX - minX) / minDistance));
    const ys = linespace(minY, maxY, Math.floor((maxY - minY) / minDistance));

    const tree = this.pc2Tree(pc.tolist());
    const start2 = Date.now();

    // grid
    let road = [];
    const halfDistance = minDistance / 2;
    for (const x of xs) {
      for (const y of ys) {
        const ps = searchRect(
          tree,
          x - halfDistance,
          y - halfDistance,
          x + halfDistance,
          y + halfDistance,
        );
        if (ps.length > 0) {
          //选择最低的点
          const p = ps.reduce((c, v) => (c[2] < v[2] ? c : v), ps[0]);
          const z = p[2];
          if (z >= minZ && z < maxZ) {
            const zs = nj.array(ps.filter((p_) => p_ !== p).map((p_) => p_[2]));
            if (z > zs.min() - 0.5) {
              road.push(p);
            }
          }
        }
      }
    }
    console.log(`init road point count: ${road.length}`);

    // filter outlier
    road = filterOutlier(road, {});
    const validRoad = [];
    const removedRoad = [];
    let roadTree = this.pc2Tree(road);

    //filter by slope
    const maxAngle_ = (maxAngle * Math.PI) / 180;
    const distance = minDistance * 20;
    for (const p of road) {
      const [x, y, z] = p;
      const neighbors = searchRect(
        roadTree,
        x - distance,
        y - distance,
        x + distance,
        y + distance,
      );
      const lowerPs = neighbors.filter((v) => v[2] < z);

      let valid = true;
      for (const lp of lowerPs) {
        const d = distance2dArray(lp, p);
        const angle = Math.atan2(z - lp[2], d);
        if (angle > maxAngle_) {
          valid = false;
          // console.log(`drop point: angle(${angle * 180 / Math.PI})`, obj);
          break;
        }
      }

      if (valid) {
        validRoad.push(p);
      } else {
        removedRoad.push([x, y]);
      }
    }

    roadTree = this.pc2Tree(validRoad);

    // 构造总体点云的路面标记
    const start3 = Date.now();
    const fullRoad = new Uint8Array(N);
    const maxZOffset = 0.1;
    const flags = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const p = pc.pick(i).tolist();
      const [x, y, z] = p;
      const roadPoint = roadTree.find(x, y);
      if (roadPoint) {
        const roadMaxZ = roadPoint[2] + maxZOffset;
        flags[i] = z - roadMaxZ;
        if (flags[i] <= 0) {
          fullRoad[i] = 1;
        }
      }
    }
    const start4 = Date.now();

    // 填补路面
    // roadTree = this.pc2Tree(fullRoad);
    // for (const [x, y] of removedRoad) {
    //     const neighbors = searchRect(roadTree, x - halfDistance, y - halfDistance, x + halfDistance, y + halfDistance);
    //     if (neighbors.length > 0) {
    //         const z = nj.array(neighbors.map((p_) => p_[2])).max();
    //         validRoad.push([x, y, z]);
    //     }
    // }
    const start5 = Date.now();
    this.fullRoad = fullRoad;
    this.roadTree = roadTree;
    console.log(
      `extractRoad(#${validRoad.length}, distance: ${minDistance}, angle: ${maxAngle}) ${
        (Date.now() - start) / 1000
      }s (build: ${(start2 - start) / 1000}s, filter: ${(start3 - start2) / 1000}s, flags: ${
        (start4 - start3) / 1000
      }s, supp: ${(start5 - start4) / 1000}s)`,
    );
    return flags;
  }

  segments(pc) {
    const start = Date.now();
    const roadIndices = [];
    const aboveIndices = [];

    this.roadFlags.forEach(function (v, i) {
      if (v <= 0) {
        roadIndices.push(i);
      } else {
        aboveIndices.push(i);
      }
    });

    const abovePc = aboveIndices.map((i) => pc.pick(i).tolist());

    // build labels
    const labels = new Array(pc.shape[0]);

    // road labels
    roadIndices.forEach((i) => (labels[i] = 0));

    // object labels
    const [abovelabels, labelIndices] = DBScan(abovePc, { minPts: 20, eps: 1.0 });
    abovelabels.forEach(function (label, i) {
      const idx = aboveIndices[i];
      if (label == -1 || labelIndices[label].length < 20) {
        labels[idx] = -1;
      } else {
        labels[idx] = label + 1; // start with 1
      }
    });

    // // filter
    // labelIndices.forEach(function(indices, label) {
    //     if (indices.length >= 20 && cs.length < 100) {
    //         const zs = indices.map((i) => abovePc[i][2]);
    //         zs
    //     }
    // });

    console.log(`segments #${pc.shape[0]}, ${(Date.now() - start) / 1000}s`);
    return labels;
  }
}

function transferColor(fromGeometry, toGeometry) {
  const start = Date.now();
  const fromColors = fromGeometry.attributes.color.array;

  const fromPosition = fromGeometry.attributes.position;
  const fromPoints = range(fromPosition.count).map((i) => [
    ...fromPosition.array.subarray(i * 3, i * 3 + 3),
    i,
  ]);
  const tree = d3.octree().addAll(fromPoints);

  const toPoints = nj.float32(toGeometry.attributes.position.array).reshape(-1, 3);
  const toColors = toGeometry.attributes.color.array;
  for (let i = 0; i < toPoints.shape[0]; i++) {
    const [x, y, z] = toPoints.pick(i).tolist();
    const nearestNeighbor = tree.find(x, y, z);
    const startColorIndex = nearestNeighbor[3] * 3;
    for (let j = 0; j <= 2; j++) {
      toColors[i * 3 + j] = fromColors[startColorIndex + j];
    }
  }
  toGeometry.attributes.color.needsUpdate = true;
  console.log(`transfer #${toPoints.shape[0]}, ${(Date.now() - start) / 1000}s`);
}
export { ObjectBox, nj, d3 };
