// @ts-ignore
// import CreateWorker from './worker?worker&url';
import Editor from '../../../Editor';
import { ITaskEnum, IMessage, IMsgHandler, ICallBack } from './type';
import * as THREE from 'three';

let seedMsgID = 100;
function createMsgID() {
  seedMsgID += 1;
  return seedMsgID + '';
}

export default class CreateTask {
  editor: Editor;
  worker: Worker;
  handleMap: Map<string, IMsgHandler> = new Map();
  isInit: boolean = false;
  nextJob?: { data: IMessage; transfer?: Transferable[] };
  working: boolean = false;
  constructor(editor: Editor) {
    this.editor = editor;
    // this.worker = new CreateWorker() as Worker;
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    this.initWorkerEvent();
  }
  run() {
    if (this.nextJob && !this.working) {
      const { data, transfer } = this.nextJob;
      this.working = true;
      this.worker.postMessage(data, transfer || []);
      this.nextJob = undefined;
    }
  }
  postMessage(msg: ITaskEnum, data?: any, transfer?: Transferable[]) {
    const msgKey = createMsgID();
    const frameId = this.getCurFrameID();
    return new Promise<IMessage>((resolve, reject) => {
      // const frame = this.editor.getCurrentFrame();
      this.handleMap.set(msgKey, { resolve, reject });
      this.nextJob = {
        data: { type: msg, data, frameId, msgId: msgKey },
        transfer: transfer,
      };
      this.run();
    });
  }
  initWorkerEvent() {
    this.worker.addEventListener('message', ({ data }) => {
      const msg = data as IMessage;
      const msgHandler = this.handleMap.get(msg.msgId);
      const frameId = this.getCurFrameID();
      if (msgHandler) {
        switch (msg.type) {
          case ITaskEnum.Error:
            msgHandler.reject(msg);
            // this.editor.showMsg('error', msg.data || 'error');
            break;
          case ITaskEnum.Init:
          case ITaskEnum.Create:
          case ITaskEnum.ROAD:
          case ITaskEnum.ROAD_Z:
          case ITaskEnum.Reset:
          default:
            msgHandler.resolve(msg);
            break;
        }
        this.handleMap.delete(msg.msgId);
      }
      if (msg.type !== ITaskEnum.Reset) this.isInit = true;
      this.working = false;
      this.run();
    });
  }
  getCurFrameID() {
    const frame = this.editor.getCurrentFrame();
    return frame?.id;
  }
  init(pc: THREE.Float32BufferAttribute) {
    if (this.isInit) return;
    const float32Array = pc.array as Float32Array;
    const buffer = float32Array.buffer.slice(0);
    return this.postMessage(ITaskEnum.Init, { pc: buffer }, [buffer]);
  }
  reset() {
    if (!this.isInit) return;
    this.isInit = false;
    return this.postMessage(ITaskEnum.Reset, '');
  }
  getRoadZByPosition(coordinate: THREE.Vector3[], pc: THREE.Float32BufferAttribute) {
    const float32Array = pc.array as Float32Array;
    const buffer = float32Array.buffer.slice(0);
    return this.postMessage(
      ITaskEnum.ROAD_Z,
      {
        pc: buffer,
        coordinate: coordinate,
      },
      [buffer],
    );
  }
  getRoadIndices(pc: THREE.Float32BufferAttribute) {
    const float32Array = pc.array as Float32Array;
    const buffer = float32Array.buffer.slice(0);
    return this.postMessage(
      ITaskEnum.ROAD,

      {
        pc: buffer,
      },
      [buffer],
    );
  }
  create(
    pc: THREE.Float32BufferAttribute,
    projectPos: THREE.Vector2[],
    matrix: THREE.Matrix4,
    headAngle: number,
    deNoise = true,
    heightRange = [-Infinity, Infinity],
  ) {
    const float32Array = pc.array as Float32Array;
    const buffer = float32Array.buffer.slice(0);
    return this.postMessage(
      ITaskEnum.Create,
      {
        pc: buffer,
        projectPos,
        heightRange: JSON.parse(JSON.stringify(heightRange)),
        matrix: matrix.toArray(),
        headAngle,
        deNoise,
      },
      [buffer],
    );
  }
}
