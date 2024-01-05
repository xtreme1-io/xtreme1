import Action from './Action';
import ImageView from '../index';
import Konva from 'konva';
import { Shape } from '../shape';
import { Cursor } from '../../configs';

type IFilter = (e: any) => boolean;

const actionName = 'select-hover';
class SelectHoverAction extends Action {
  // enabled = true;
  selectFlag = true;
  stageClickFlag = true;
  cursorFlag = true;
  view: ImageView;
  filter?: IFilter;

  constructor(view: ImageView) {
    super();
    this.view = view;
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseClick = this.onMouseClick.bind(this);
    this.onClick = this.onClick.bind(this);
  }
  init() {
    this.view.stage.on('mouseover', this.onMouseOver);
    this.view.stage.on('mouseout', this.onMouseOut);
    this.view.stage.on('click', this.onMouseClick);
    // click
    this.view.shapes.on('click', this.onClick);
  }
  destroy() {
    this.view.stage.off('mouseover', this.onMouseOver);
    this.view.stage.off('mouseout', this.onMouseOut);
    this.view.stage.off('click', this.onMouseClick);
    this.view.shapes.off('click', this.onClick);
  }

  onMouseClick(e: Konva.KonvaEventObject<MouseEvent>) {
    // if (!this.enabled) return;
    if (e.evt.button !== 0 || !this.selectFlag || !this.stageClickFlag) return;

    if (this.filter && !this.filter(e.target)) return;
    if (e.target === this.view.stage && !this.view.currentDrawTool) {
      const editor = this.view.editor;
      if (editor.selection.length > 0) editor.selectObject([]);
    }
  }
  onMouseOver(e: Konva.KonvaEventObject<MouseEvent>) {
    if (this.filter && !this.filter(e.target)) return;

    if (e.target === this.view.stage) {
      this.view.setCursor(this.view.cursor || Cursor.auto);
      return;
    }

    let target = e.target as Shape;
    const object = target.object;

    target = object || target;
    if (!target.attrs.skipStateStyle) this.view.setState(target, { hover: true });

    if (this.cursorFlag) {
      this.view.setCursor(target.attrs.cursor || this.view.cursor || Cursor.pointer);
    }
  }

  onMouseOut(e: Konva.KonvaEventObject<MouseEvent>) {
    if (this.filter && !this.filter(e.target)) return;
    // if (!this.enabled) return;
    // console.log('mouseout', e);
    if (e.target === this.view.stage) {
      return;
    }

    let target = e.target as Shape;
    const object = target.object;

    target = object || target;
    if (!target.attrs.skipStateStyle) this.view.setState(target, { hover: false });

    if (this.cursorFlag) {
      this.view.setCursor(this.view.cursor || Cursor.auto);
    }
  }

  // click
  onClick(e: Konva.KonvaEventObject<MouseEvent>) {
    // if (!this.enabled) return;
    if (e.evt.button !== 0 || !this.selectFlag) return;

    if (this.filter && !this.filter(e.target)) return;

    const editor = this.view.editor;
    const event = e.evt;
    let target = e.target as Shape;

    target = target.object || target;

    if (!target.attrs.selectable) return;

    console.log(target);
    if (event.shiftKey) {
      const { selection, selectionMap } = editor;
      let newSelection = [...selection];
      if (selectionMap[target.uuid]) {
        // remove
        newSelection = newSelection.filter((e) => e !== target);
      } else {
        newSelection.push(target);
      }
      editor.selectObject(newSelection);
    } else {
      editor.selectObject(target);
    }
    // editor.mainView.focusView();
  }
}

SelectHoverAction.prototype.actionName = actionName;

export default SelectHoverAction;
