import Konva from 'konva';
import { colord } from 'colord';
import { Shape } from '../shape';
import { traverseShape } from './common';

const DD = Konva.DD;
export function hackOverwriteShape() {
  Konva.Node.prototype._listenDrag = function () {
    this._dragCleanup();

    this.on('mousedown.konva touchstart.konva', function (evt: Konva.KonvaEventObject<any>) {
      // TODO
      const stage = this.getStage();
      if (stage && (stage as any).globalDisableDrag) {
        return;
      }

      const shouldCheckButton = evt.evt['button'] !== undefined;
      const canDrag = !shouldCheckButton || Konva.dragButtons.indexOf(evt.evt['button']) >= 0;
      if (!canDrag) {
        return;
      }
      if (this.isDragging()) {
        return;
      }

      let hasDraggingChild = false;
      DD._dragElements.forEach((elem) => {
        if (this.isAncestorOf(elem.node)) {
          hasDraggingChild = true;
        }
      });
      // nested drag can be started
      // in that case we don't need to start new drag
      if (!hasDraggingChild) {
        this._createDragElement(evt);
      }
    });
  };
  // shape._dragChange();

  const _oldSetAttr = Konva.Node.prototype._setAttr;
  Konva.Node.prototype._setAttr = function (key: any, val: any) {
    if (key === 'fill' && val) {
      const rgba = colord(val);
      this.attrs.fillColorRgba = rgba.toRgb();
    }
    _oldSetAttr.call(this, key, val);
  };

  Konva.Group.prototype._validateAdd = function () {};

  // colorKey
  const _fire = Konva.Container.prototype._fire;
  Konva.Container.prototype._fire = function (eventType: string, evt: any) {
    _fire.call(this, eventType, evt);
    if (eventType === 'add' && evt.child) {
      if (!evt.currentTarget.getStage()) return;
      addShapeKey(evt.child as Shape);
    }
  };

  const _remove = Konva.Node.prototype._remove;
  Konva.Node.prototype._remove = function () {
    if (this.getStage()) {
      removeShapeKey(this);
    }
    _remove.call(this);
  };
}

export function removeShapeKey(object: any) {
  object = Array.isArray(object) ? object : [object];
  traverseShape(object, (child: Konva.Shape) => {
    // console.log('remove', child, child.colorKey);
    if (child.colorKey) delete Konva.shapes[child.colorKey];
  });
}

export function addShapeKey(object: any) {
  object = Array.isArray(object) ? object : [object];
  traverseShape(object, (child: Konva.Shape) => {
    // console.log('add', child, child.colorKey);
    const colorKey = child.colorKey;
    const existShape = Konva.shapes[colorKey];
    if (existShape && existShape !== child) {
      child.colorKey = getColorKey();
    }
    Konva.shapes[child.colorKey] = child;
  });
}

export function getColorKey() {
  let key = '';
  // eslint-disable-next-line no-constant-condition
  while (true) {
    key = Konva.Util.getRandomColor();
    if (key && !(key in Konva.shapes)) {
      break;
    }
  }

  return key;
}
