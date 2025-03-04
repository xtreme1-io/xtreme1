import { AnnotateObject, Editor, ImageView, Skeleton, Konva } from 'image-editor';

const DASH_GROUP = 'dash-group';
type ACTION = 'update';
const dashStyle = {
  draggable: false,
  fill: '#ff000050',
  stroke: '#ff000050',
  dash: [20, 10],
};
/**
 * 全局列表虚框
 */
export default class DashObject {
  private static _instance: DashObject;
  public static getInstance(editor?: Editor) {
    if (!this._instance) {
      this._instance = new DashObject();
      editor && this._instance.initEditor(editor);
    }
    return this._instance;
  }

  editor!: Editor;
  view!: ImageView;
  shapes!: Konva.Group;
  dashGroup: Konva.Group;

  constructor() {
    this.dashGroup = new Konva.Group();
    this.dashGroup.name(DASH_GROUP);
    this.dashGroup.listening(false);

    this.onAction = this.onAction.bind(this);
  }
  initEditor(editor: Editor) {
    this.editor = editor;
    this.view = editor.mainView;
    this.shapes = editor.mainView.shapes;
  }
  onAction(action: ACTION) {
    if (!this.editor.state.config.showAllObject) {
      this.clear();
      return;
    }
    this.checkDashGroup();
    switch (action) {
      case 'update': {
        this.checkDashObject();
        break;
      }
    }
    this.updateObjectVisible();
  }
  checkDashGroup() {
    const dashGroup: any = this.shapes.getChildren((e: any) => e.name == DASH_GROUP)[0];
    if (!dashGroup) {
      this.dashGroup.removeChildren();
      this.shapes.add(this.dashGroup);
    }
  }
  checkDashObject() {
    if (this.editor.selection.length === 0) return;
    const dashObjs = this.editor.selection.filter((e) => {
      const objs = this.editor.trackManager.getObjectByTrackId(e.userData.trackId);
      return !(objs?.length > 0);
    });
    if (dashObjs.length === 0) return;
    const newObjs = dashObjs.map((e) => {
      const newObj = e.cloneThisShape();
      return newObj;
    });
    this.addDashObject(newObjs);
  }
  addDashObject(objects: AnnotateObject | AnnotateObject[]) {
    if (!Array.isArray(objects)) objects = [objects];
    objects.forEach((e) => {
      e.state.dashed = true;
      if (e instanceof Skeleton) {
        e.edges.forEach((edge) => edge.setAttrs(dashStyle));
        e.points.forEach((point) => point.setAttrs(dashStyle));
      } else {
        e.setAttrs(dashStyle);
      }
      if (!this.hasObject(e)) this.dashGroup.add(e as any);
    });
  }
  hasObject(obj: AnnotateObject) {
    const dashObjects = (this.dashGroup.children || []) as AnnotateObject[];
    const index = dashObjects.findIndex((e) => e.userData.trackId === obj.userData.trackId);
    return index >= 0;
  }
  updateObjectVisible() {
    if (!this.dashGroup) return;
    const selectIds = this.editor.selection.map((e) => e.userData.trackId);
    const dashObjects = (this.dashGroup.children || []) as AnnotateObject[];
    if (dashObjects.length === 0) return;
    // console.log('================>updateObjectVisible:', selectIds);
    // console.log('================>updateObjectVisible:', dashObjects);
    dashObjects.forEach((e) => {
      if (selectIds.includes(e.userData.trackId)) {
        e.showVisible = true;
      } else {
        e.showVisible = false;
      }
    });
  }
  clear() {
    this.dashGroup.removeChildren();
  }
}
