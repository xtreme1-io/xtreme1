import { Circle, SkeletonTool } from 'image-editor';
import Editor from '../../../Editor';

type changeType = 'anchor' | 'skeleton';
interface ICmdData {
  type: changeType;
  skeuuid: string;
  nowIndex: number;
  nextIndex: number;
  data: any[];
}
export default class SkeletonToolCmd {
  private static _instance: SkeletonToolCmd;
  public static getInstance(): SkeletonToolCmd {
    if (!this._instance) this._instance = new SkeletonToolCmd();
    return this._instance;
  }

  editor!: Editor;
  tool!: SkeletonTool;
  operateList: ICmdData[] = [];
  constructor() {}
  init(editor: Editor, tool: SkeletonTool) {
    this.editor = editor;
    this.tool = tool;
    this.clear();
    this.initEvent();
  }
  initEvent() {
    this.onChangeBefore = this.onChangeBefore.bind(this);
    this.undo = this.undo.bind(this);
    this.tool.on('change-before', this.onChangeBefore);
    this.tool.on('change-end', this.onChangeEnd);
    this.tool.on('ske-tool-undo', this.undo);
  }
  clear() {
    this.operateList = [];
  }
  execute() {}
  undo() {
    const lastData = this.operateList.pop();
    if (!lastData || !this.tool?.object || lastData.skeuuid !== this.tool.object.uuid) return;
    const { type, nowIndex, nextIndex, data } = lastData;
    if (type === 'anchor') {
      data.forEach((e) => {
        const target = this.tool.object.points[e.anchorIndex];
        if (!target) return;
        target.setAttrs({ ...e.anchorAttrs });
        Object.assign(target.userData, e.anchorUserdata);
      });
      this.tool.currentIndex = nowIndex;
      this.tool.nextIndex = nextIndex;
    }
    this.tool.object.onPointChange();
    this.tool.emit('change');
    this.editor.mainView.updateStateStyle(this.tool.object);
    this.editor.mainView.draw();
  }
  redo() {}
  onChangeBefore(data: { type: changeType; anchors: number[] }) {
    if (!this.tool?.object) return;
    const { type, anchors } = data;
    const cmdData: ICmdData = {
      type,
      skeuuid: this.tool.object.uuid,
      nowIndex: this.tool.currentIndex,
      nextIndex: this.tool.nextIndex,
      data: [],
    };
    if (anchors) {
      anchors.forEach((idx) => {
        const target = this.tool.object.points[idx];
        if (!target) return;
        cmdData.data.push({
          anchorIndex: idx,
          anchoruuid: target.uuid,
          anchorAttrs: this.getAnchorAttrData(target),
          anchorUserdata: this.getAnchorUserData(target),
        });
      });
      this.operateList.push(cmdData);
    }
  }
  onChangeEnd() {}
  getAnchorAttrData(target: Circle) {
    const { valid, x, y, fill } = target.attrs;
    return { valid, x, y, fill };
  }
  getAnchorUserData(target: Circle) {
    const { tag, tagColor, tagId } = target.userData;
    return { tag, tagColor, tagId };
  }
}
