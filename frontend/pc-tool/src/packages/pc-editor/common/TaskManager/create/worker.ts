import { IMessage, ITaskEnum } from './type';
import { ObjectBox, nj } from '../../../utils/AIBox/objectBox';
import { getAIMiniBox } from '../../../utils/AIBox/index';
// import { Vector3, Float32BufferAttribute } from 'three/src/math/Vector3';
import { Matrix4 } from 'three/src/math/Matrix4';
import { Float32BufferAttribute } from 'three/src/core/BufferAttribute';
const worker: Worker = self as any;

let tool: ObjectBox | undefined;
function postMsg(msg: IMessage, transfer: Transferable[] = []) {
  worker.postMessage(msg, transfer);
}
// handle message
worker.addEventListener('message', async ({ data }) => {
  const msg = data as IMessage;
  // console.log('msg', msg);
  const reMsg: IMessage = {
    msgId: msg.msgId,
    type: msg.type,
    frameId: msg.frameId,
    data: undefined,
  };
  try {
    switch (msg.type) {
      case ITaskEnum.Init:
        init(msg);
        break;

      case ITaskEnum.Create:
        reMsg.data = execute(msg);
        break;
      case ITaskEnum.ROAD_Z:
      case ITaskEnum.ROAD:
        return execute(msg);
      case ITaskEnum.Reset:
        tool = undefined;
        break;
      default:
        break;
    }
    postMsg(reMsg);
  } catch (error) {
    console.error(error);
    handleError(msg);
  }
});
function handleError(msg: IMessage) {
  postMsg({
    msgId: msg.msgId,
    type: ITaskEnum.Error,
    data: 'error',
  } as IMessage);
}
function init(msg: IMessage) {
  const pc = msg.data?.pc;
  if (pc) {
    const float32array = new Float32Array(pc);
    const attrArray = new Float32BufferAttribute(float32array, 3);
    const nj_pc = nj.float32(float32array).reshape(-1, 3);
    tool = new ObjectBox(nj_pc, { roadPc: null });
    tool.pc_source = attrArray;
    tool.frameId = msg.frameId;
  }
}
function execute(msg: IMessage) {
  if (!tool || tool.frameId != msg.frameId) {
    init(msg);
  }
  let { projectPos, deNoise, headAngle, matrix, heightRange, coordinate } = msg.data || {};
  // transform.position = new Vector3().copy(transform.position);
  // transform.scale = new Vector3().copy(transform.scale);
  // transform.rotation = new Euler().copy(transform.rotation);
  switch (msg.type) {
    case ITaskEnum.Create:
      matrix = new Matrix4().fromArray(matrix);
      if (tool) {
        return getAIMiniBox(
          tool,
          tool.pc_source,
          projectPos,
          matrix,
          headAngle,
          heightRange,
          deNoise,
        );
      }
      break;
    case ITaskEnum.ROAD:
      if (tool) {
        const fullRoad = tool.fullRoad;
        const buffer = fullRoad.buffer.slice(0);
        msg.data = buffer;
        postMsg(msg, [buffer]);
      }
      break;
    case ITaskEnum.ROAD_Z:
      if (tool) {
        const zValue = tool.maxZByPosition(coordinate);
        msg.data = zValue;
        postMsg(msg);
      }
      break;
  }

  // return transform;
}
