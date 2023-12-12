// @ts-ignore
import nj from './numjs.js';
import { ObjectBox } from './objectBox';
import { Float32BufferAttribute } from 'three/src/core/BufferAttribute';
import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { Matrix4 } from 'three/src/math/Matrix4';
import { Euler } from 'three/src/math/Euler';

// function subpcFromCanvasRect(
//     camera: THREE.Camera,
//     renderer: THREE.Renderer,
//     points: THREE.Float32BufferAttribute,
//     p1: THREE.Vector2,
//     p2: THREE.Vector2,
// ) {
//     let { clientHeight: height, clientWidth: width } = renderer.domElement;

//     const left = Math.min(p1.x, p2.x);
//     const right = Math.max(p1.x, p2.x);
//     const top = Math.min(p1.y, p2.y);
//     const bottom = Math.max(p1.y, p2.y);

//     let matrix = new THREE.Matrix4();
//     matrix.set(width / 2, 0, 0, width / 2, 0, -height / 2, 0, height / 2, 0, 0, 0, 0, 0, 0, 0, 1);
//     matrix.multiply(camera.projectionMatrix);
//     matrix.multiply(camera.matrixWorldInverse);

//     // const positions = points.geometry.attributes.position;
//     const positions = points;
//     const ps = [];
//     let pos = new THREE.Vector3();
//     for (let i = 0; i < positions.count; i++) {
//         pos.fromBufferAttribute(positions, i);
//         pos.applyMatrix4(matrix);
//         const u = pos.x,
//             v = pos.y;

//         if (u >= left && u <= right && v >= top && v <= bottom) {
//             ps.push([positions.getX(i), positions.getY(i), positions.getZ(i)]);
//         }
//     }
//     return nj.array(ps);
// }
function subPcFromProjectPos(
  projectPos: Vector2[],
  matrix: Matrix4,
  positions: Float32BufferAttribute,
  heightRange = [-Infinity, Infinity],
) {
  // let matrix = new THREE.Matrix4();
  // const quaternion = new THREE.Quaternion().setFromEuler(transform.rotation);
  // matrix.compose(transform.position, quaternion, transform.scale).invert();
  // let box = new THREE.Box3(new THREE.Vector3(-0.5, -0.5, -0.5), new THREE.Vector3(0.5, 0.5, 0.5));
  const pos = new Vector3();
  const boxPc: number[][] = [];
  const minX = Math.min(projectPos[0].x, projectPos[1].x);
  const minY = Math.min(projectPos[0].y, projectPos[1].y);
  const maxX = Math.max(projectPos[0].x, projectPos[1].x);
  const maxY = Math.max(projectPos[0].y, projectPos[1].y);
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    if (z < heightRange[0] || z > heightRange[1]) continue;
    pos.set(x, y, z).applyMatrix4(matrix);
    if (minX <= pos.x && maxX >= pos.x && minY <= pos.y && maxY >= pos.y) {
      boxPc.push([x, y, z]);
    }
  }
  return nj.array(boxPc);
}
export function getAIMiniBox(
  tool: ObjectBox,
  attributes: THREE.Float32BufferAttribute,
  projectPos: Vector2[],
  matrix: Matrix4,
  headAngle: any,
  heightRange?: [number, number],
  deNoise = true,
) {
  const subpc = subPcFromProjectPos(projectPos, matrix, attributes, heightRange);
  if (subpc.size === 0) {
    return;
  }
  const boxInfo = tool.box3dFromSubpc(subpc, { headAngle });
  if (boxInfo) {
    const [x, y, z, dx, dy, dz, rotationZ] = boxInfo;
    return {
      position: new Vector3(x, y, z),
      scale: new Vector3(dx, dy, dz),
      rotation: new Euler(0, 0, rotationZ),
    };
  }
}
