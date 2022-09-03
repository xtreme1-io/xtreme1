import { Factory } from 'konva/lib/Factory';
import { Shape } from 'konva/lib/Shape';
import { getBooleanValidator, getComponentValidator } from 'konva/lib/Validators';
import { _registerNode } from 'konva/lib/Global';
function _fillFunc(context) {
    context._context.fill('evenodd');
}
function _sceneFunc(context) {
    let closed = this.closed();
    let outer = this._getExterior();

    context.beginPath();
    context.moveTo(outer[0].x, outer[0].y);
    for (let i = 1; i < outer.length; i++) {
        let p = outer[i];
        context.lineTo(p.x, p.y);
    }
    if (closed) {
        context.closePath();
    }
    let interior = this._getInterior().map((ring) => ring.points);
    interior.forEach((ring) => {
        context.moveTo(ring[0].x, ring[0].y);
        for (let i = 1; i < ring.length; i++) {
            let p = ring[i];
            context.lineTo(p.x, p.y);
        }
        context.closePath();
    });
    if (closed) {
        context.fillStrokeShape(this);
    } else {
        context.strokeShape(this);
    }
}
export class PolygonShape extends Shape {
    _sceneFunc(context) {
        let closed = this.closed();
        let outer = this._getExterior();

        context.beginPath();
        context.moveTo(outer[0].x, outer[0].y);
        for (let i = 1; i < outer.length; i++) {
            let p = outer[i];
            context.lineTo(p.x, p.y);
        }
        if (closed) {
            context.closePath();
        }
        let interior = this._getInterior().map((ring) => ring.points);
        interior.forEach((ring) => {
            context.moveTo(ring[0].x, ring[0].y);
            for (let i = 1; i < ring.length; i++) {
                let p = ring[i];
                context.lineTo(p.x, p.y);
            }
            context.closePath();
        });
        context.fillStrokeShape(this);
    }
    _getExterior() {
        return this.attrs.points || [];
    }
    _getInterior() {
        return this.attrs.interior || [];
    }
    getSelfRect() {
        const points = this._getExterior();
        var minX = points[0].x;
        var maxX = points[0].x;
        var minY = points[0].y;
        var maxY = points[0].y;
        points.forEach((point) => {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        });
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        };
    }
    getWidth() {
        return this.getSelfRect().width;
    }
    getHeight() {
        return this.getSelfRect().height;
    }
}
PolygonShape.prototype._fillFunc = _fillFunc;
PolygonShape.prototype._fillFuncHit = _fillFunc;
PolygonShape.prototype._sceneFunc = _sceneFunc;
PolygonShape.prototype._hitFunc = _sceneFunc;

PolygonShape.prototype.className = 'PolygonShape';
PolygonShape.prototype._attrsAffectingSize = ['points'];

_registerNode(PolygonShape);
Factory.addGetterSetter(PolygonShape, 'closed', false, getBooleanValidator());
Factory.addGetterSetter(PolygonShape, 'points', [], getComponentValidator());
Factory.addGetterSetter(PolygonShape, 'interior', [], getComponentValidator());
