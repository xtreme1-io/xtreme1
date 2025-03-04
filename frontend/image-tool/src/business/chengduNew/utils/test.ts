import { Polygon, Rect, Shape, utils } from 'image-editor';
import Editor from '../common/Editor';

/**
 * 一些用于控制台调试的代码类
 */
export default class WindowTest {
  private static _instance: WindowTest;
  public static getInstance(): WindowTest {
    if (!this._instance) {
      this._instance = new WindowTest();
    }
    return this._instance;
  }

  editor!: Editor;
  constructor() {}
  init(editor: Editor) {
    this.editor = editor;
    // @ts-ignore
    window.TESTCode = this;
  }
  // 获取选中面积
  getArea(shape?: any) {
    const poly = shape || this.editor.selection[0];
    if (!(poly instanceof Polygon)) throw 'need a polygon';
    const area = poly.getArea();
    return area;
  }
  // 标注顺序
  shapePointsSort(shape?: Shape) {
    const poly = shape || this.editor.selection[0];
    if (!(poly instanceof Shape)) throw 'need a shape';
    const points = poly.attrs.points;
    if (!points || points.length === 0) throw 'no points';
    return utils.countPointsOrder(points);
  }
  // create 10000 rect
  createRects(num: number = 10000) {
    const { backgroundWidth, backgroundHeight } = this.editor.mainView;
    const width = 10;
    const height = 10;
    const maxW = backgroundWidth - width;
    const maxH = backgroundHeight - height;
    const list: Rect[] = [];
    for (let i = 0; i < num; i++) {
      const x = Math.random() * maxW;
      const y = Math.random() * maxH;
      list.push(new Rect({ x, y, width, height }));
    }
    this.editor.dataManager.addAnnotates(list);
  }
}
