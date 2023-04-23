import Konva from 'konva';
import uuid from 'uuid/v4';
import { Event } from '../../../config/event';
import {
    setColorAlpha,
    getScaleFactor,
    xytoArr,
    createAnchor,
    CONSTANT,
    MODETYPE,
    fixedPointPositionIfNeed,
    limitInBBoxIfNeed,
    isEqualPoint,
    CURSOR,
    getPolygonCenter,
    rotatePoint,
    toImageCord,
    transformPoints,
    getBoudingBox,
    getArea,
    getSelectedShapByCurrentTool,
} from '../../util';
import { config } from '../../config';
import { UIType } from '../../../config/mode';
import { cloneDeep } from 'lodash';
export class BaseShape {
    constructor(view, opt = {}) {
        this.view = view;

        this.id = opt.id;
        this.uuid = opt.uuid || uuid();
        this.intId = typeof opt.intId !== 'undefined' ? opt.intId : this._getIntId();
        this.shapelayer = view.shapelayer;
        this.helplayer = view.helplayer;
        this.name = CONSTANT.SHAPENAME;
        this.shape = null;
        this._label = null;
        this.closed = opt.closed || false;
        this.finish = opt.finish || false;
        this.strokeWidth = CONSTANT.STROKEWIDTH * this._getScaleFactor();
        this.stroke = opt.color || config.defaultCorlor;
        // this.classType = opt.classType || '';
        // this.attrs = opt.attrs || {};
        this.points = opt.points || [];
        this.userData = opt.userData || {};
        this.controlPoints = null;
        this.anchors = [];
        this.edges = [];
        this.interior = [];
        this.selected = false;
        this.highlight = false;
        this.hasAnchor = false;
        this.needMidAnchor = false;

        this._fromJson = opt.fromJson || false;

        this.width = 0;
        this.height = 0;
        this.area = 0;
        this.length = 0;
        this.visibility = true;
        this.isInside = true;

        // this._markers = new Set();
    }
    static fromJSON(view, item, fromJson = true) {
        let dim = view.limitBbox;
        let coordinate = item.coordinate;
        // console.log(coordinate);
        item.points = transformPoints(coordinate, dim);
        if (item.interior) {
            item.interior = item.interior.map((ring) => {
                ring.points = transformPoints(ring.coordinate, dim);
                return ring;
            });
        }
        item.fromJson = fromJson;
        item.finish = true;
        return new this(view, item);
    }
    get showAnchor() {
        // if (this.type == 'rectextend' && !this.finish) {
        //     return false;
        // }
        // if (this.type == 'rectS') {
        //     return this.shape.visible();
        // }
        if (this.controlPoints) {
            return true;
        }
        if (this.hasAnchor && !this.finish) {
            return this.type === 'rectangle' ? false : true;
        }
        if (this.hasAnchor && this.selected && this.view.mode === MODETYPE.edit) {
            return true;
        }

        return false;
    }
    get _index() {
        return this.shape && this.shape.zIndex();
    }
    _getIntId() {
        return this.view.shapeIntId;
    }
    checkValid() {
        this._valid = true;
    }
    formatLabelText(item) {
        if (this.userData.classType || this.userData.modelClass) {
            return this.userData.classType || this.userData.modelClass;
        }
        return 'Class Required';
    }
    zIndex(index) {
        this.shape.zIndex(index);
    }
    selector() {
        return '.' + this.type;
    }
    // checkValid() {
    //     this._valid = true;
    // }
    createShape() {
        this.view.setDrawingState(true);
        this.shape.addName(CONSTANT.SHAPENAME);
        this.shape.addName(this.type);
        // https://konvajs.org/docs/performance/Disable_Perfect_Draw.html
        this.shape.perfectDrawEnabled(false);
        this.shape.owner = this;
        // this.view.addShape(this);
        // this.shape.on('visibleChange', () => {
        //     this.updateAnchors();
        // })
    }
    highLight(highlight) {
        this.highlight = highlight;
        this.updateShapeColor();
        if (highlight) {
            this.shape.addName(CONSTANT.HIGHLIGHTEDNAME);
        } else {
            this.shape.removeName(CONSTANT.HIGHLIGHTEDNAME);
        }
    }
    selectShape(active) {
        let view = this.view;
        if (active) {
            view.selectedShape = this;
            this.shape.addName(CONSTANT.SELECTEDNAME);
        } else {
            view.selectedShape = null;
            this.shape.removeName(CONSTANT.SELECTEDNAME);
        }
        if (view.activeAnchor) {
            let anchor = view.activeAnchor;
            anchor.stroke(CONSTANT.ANCHORFILL);
            anchor.strokeWidth(0);
            anchor.active = false;
            view.activeAnchor = null;
        }
        this.selected = active;
        // 高亮颜色
        this.updateShapeColor();
        if (active && this.view.mode === MODETYPE.edit) {
            this.initEdgeEdit();
        } else {
            this.endEdgeEdit && this.endEdgeEdit();
        }
        this.updateAnchors(this.controlPoints || this.points);

        if (!this.showAnchor) {
            this._removeAnchor();
        }
        this.view.emit(Event.SELECT, {
            data: {
                curSelection: Array.from(this.view.mulSelShapes),
            },
        });
        this.draw();
    }
    initEdgeEdit() {}
    endEdgeEdit() {}
    _getShapeColor() {
        if (config.userColor) {
            return config.userColor;
        } else {
            return this.stroke;
        }
    }
    _getFillColor(color) {
        // color = config.userColor || this.stroke;
        color = this._valid ? config.userColor || this.stroke : CONSTANT.INVALIDFILLCOLOR;
        return setColorAlpha(color, config.isShowMask ? 1 : config.fillalpha);
    }
    pointsNumber() {
        return this.points.filter((p) => !p.sr).length;
    }
    updateAttrs(attrs) {
        this.userData.attrs = attrs;
        this.view.emit(Event.USER_DATA_CHANGE, {
            data: {
                object: this,
                options: this,
            },
        });
    }
    updateClassType({ classType, attrs = {}, color }) {
        this.userData.classType = classType;
        this.userData.attrs = attrs;
        this.stroke = color;
        this.updateShapeColor();
        this.updateLabelText();
        this.draw();
        this.view.emit(Event.USER_DATA_CHANGE, {
            data: {
                object: this,
                options: this,
            },
        });
    }
    finishDraw() {
        this.finish = true;
        this.view.setDrawingState(false);
        this.updateShapeColor();
        this.view.addShape(this, !this._fromJson);
        this.updateLabelPosition();
        this.updateDistanceText();
        if (!this._fromJson) {
            this.view.unSelectAll();
            this.view._addMulSelectionItem(this);
            this.selectShape(true);
            this.view.emit(Event.DIMENSION_CHANGE, {
                data: this,
            });
            const currentShape = getSelectedShapByCurrentTool(this.view.editor);
            // console.log('finish currentShape', currentShape);

            // if (currentShape.type != UIType.interactive) {

            // }
            this.view.editor.cmdManager.execute('add-object', this.toJSON());
            // this.view.emit(Event.ADD_OBJECT, {
            //     data: {
            //         object: this,
            //     },
            // });
        }
    }
    _getScaleFactor() {
        return getScaleFactor(this.view);
    }

    _createAnchor(point, index, mid = false) {
        let anchorfill = config.defaultCorlor;
        let anchor = createAnchor({
            radius: CONSTANT.ANCHORRADIUS * this._getScaleFactor(),
            x: point.x,
            y: point.y,
            fill: anchorfill,
            name: CONSTANT.HELPNAME + ' ' + CONSTANT.ANCHORNAME,
            // stroke: anchorfill,
            // strokeWidth: CONSTANT.STROKEWIDTH * this._getScaleFactor(),
            hitStrokeWidth: CONSTANT.HITSTROKEWIDTH * this._getScaleFactor(),
            visible: this.shape.isVisible() && this.showAnchor,
            draggable: true,
            dragDistance: 1,
        });
        anchor.perfectDrawEnabled(false);
        anchor.point = point;
        anchor.idx = index;
        anchor.owner = this;
        anchor.cursor = CURSOR.move;
        if (this.view.toolmanager) {
            if (
                this.view.toolmanager.currentTool &&
                this.view.toolmanager.currentTool.name === UIType.polyline
            ) {
                anchor.cursor = CURSOR.pointer;
            }
        }
        anchor.on('click', (e) => {
            this.anchorOnClick(e);
        });
        anchor.on('contextmenu', (e) => {
            e.evt.preventDefault();
            this.anchorOnContextmenu(e);
        });
        anchor.on('dragstart', (e) => {
            this.startPoint = this.points[e.target.idx];
            this.view.emit(Event.DIMENSION_CHANGE_BEFORE, {
                data: this,
            });
        });
        anchor.on('dragmove', (e) => {
            this.view.updateCursor(CURSOR.none);
            this.anchorOnDragMove(e);
            anchor._moved = true;
        });
        anchor.on('dragend', () => {
            this.view.updateCursor(CURSOR.move);
            this.anchorOnDragEnd(anchor);
            anchor._moved = false;
        });
        anchor.on('mouseover', () => {
            if (this.view.mode === MODETYPE.edit) {
                this.view.updateCursor(anchor.cursor);
                anchor.radius(CONSTANT.ANCHORHOVERRADIUS * this._getScaleFactor());
                this.draw();
            }
        });
        anchor.on('mouseout', () => {
            if (this.view.mode === MODETYPE.edit) {
                this.view.updateCursor(CURSOR.auto);
                anchor.radius(CONSTANT.ANCHORRADIUS * this._getScaleFactor());
                this.draw();
            }
        });
        this.helplayer.add(anchor);
        return anchor;
    }
    activeAnchor(anchor) {
        if (this.view.activeAnchor) {
            let activeAnchor = this.view.activeAnchor;
            activeAnchor.stroke(CONSTANT.ANCHORFILL);
            activeAnchor.fill(CONSTANT.ANCHORFILL);
            activeAnchor.strokeWidth(0);
            activeAnchor.active = false;
            this.view.activeAnchor = null;
        }
        if (anchor) {
            this.view.activeAnchor = anchor;
            anchor.stroke(CONSTANT.ANCHORFILL);
            anchor.strokeWidth(CONSTANT.STROKEWIDTH * this._getScaleFactor());
            anchor.fill(CONSTANT.SELECTORANCHORFILL);
            anchor.active = true;
        }
        this.helplayer.batchDraw();
    }
    anchorOnDragMove(e) {
        let anchor = e.target;
        let bbox = this.view.limitBbox;
        let limit = config.limitInBackgroud;
        let position = fixedPointPositionIfNeed(anchor.position(), bbox, limit);
        this.view.editor.cmdManager.execute('move-point', {
            uuid: this.uuid,
            index: anchor.idx,
            current: this.startPoint,
            target: position,
        });
        this.replacePoint(position, anchor.idx);
        this.updateLabelPosition();
    }
    anchorOnDragEnd() {
        console.log('anchorOnDragEnd', this);
        this.view.emit(Event.DIMENSION_CHANGE_AFTER, {
            data: this,
        });
    }
    anchorOnContextmenu(e) {}
    anchorOnClick(e) {
        let anchor = e.target;
        this.activeAnchor(anchor);
    }
    updateAnchors(points = this.points) {
        if (this.hasAnchor) {
            let visible = this.shape.isVisible() && this.showAnchor;
            if (visible) {
                this.anchors.splice(points.length).forEach((anchor) => {
                    anchor.off();
                    anchor.destroy();
                    anchor = null;
                });
                this.anchors = points.map((p, i) => {
                    let anchor = this.anchors[i] || this._createAnchor(p, i, false);
                    anchor.visible(visible);
                    anchor.draggable(this.selected);
                    anchor.point = p;
                    anchor.owner = this;
                    anchor.position(p);
                    anchor.idx = i;
                    return anchor;
                });
                this.draw();
            }
        }
    }
    removeAnchor() {}
    _removeAnchor() {
        this.anchors.slice().forEach((anchor) => {
            anchor.off();
            anchor.destroy();
            anchor = null;
        });
        this.anchors = [];
        this.draw();
    }
    _rotate(alpha) {
        let points = this.points.slice();
        let center = getPolygonCenter(points);
        points = points.map((p) => {
            return rotatePoint(alpha, p, center);
        });
        let limit = config.limitInBackgroud;
        let outOfImage = false;
        if (limit) {
            outOfImage = points.some((p) => {
                return !this.view.background.checkInImage(p);
            });
        }
        if (outOfImage) {
            return;
        }
        // this.angle += (alpha * 180) / Math.PI;
        // this.angle = (this.angle + 360) % 360;
        this.setPoints(points);
    }
    setInterior() {}
    setPoints(points) {
        this.points = points.slice();
        this._pointsChange();
    }
    pushPoint(point) {
        let [last] = this.points.slice(-1);
        if (!(last && isEqualPoint(last, point))) {
            this.points.push(point);
            this._pointsChange();
        }
    }
    insertPoint(point, index, flag) {
        this.points.splice(index, 0, point);
        if (!flag) {
            this.view.editor.cmdManager.execute('add-point', {
                uuid: this.uuid,
                point: point,
                index: index,
            });
        }
        this._pointsChange();
    }
    removePoint(index, flag) {
        if (this.view?.activeAnchor) {
            let activeAnchor = this.view.activeAnchor;
            if (activeAnchor.idx === index) {
                this.activeAnchor(false);
            }
        }
        if (!flag) {
            this.view.editor.cmdManager.execute('remove-point', {
                uuid: this.uuid,
                point: this.points[index],
                index: index,
            });
        }
        this.points.splice(index, 1);
        this._pointsChange();
    }
    replacePoint(point, index) {
        let replaced = this.points[index] || {};
        this.points.splice(index, 1, { ...replaced, ...point });
        this._pointsChange();
    }
    _pointsChange() {
        this.shape.points(xytoArr(this.points));
        this.updateDistanceText();
        this.checkValid();
        this.updateShapeColor();
        this.updateAnchors(this.controlPoints || this.points);
        this.updateLabelPosition();
        this.draw();
        this.view.emit(Event.DIMENSION_CHANGE, {
            data: this,
        });
    }
    setInvisible(invisible) {
        this.invisible = invisible;
        this.updateShapeColor();
    }
    _clacDimension() {
        let points = this.points.map((p) => {
            return toImageCord(p, this.view.limitBbox);
        });
        let { width, height } = getBoudingBox(points);
        let area = getArea(points);
        this.width = width;
        this.height = height;
        this.area = area;
    }
    updateDistanceText(points) {
        this._clacDimension();
    }
    updateShapeColor() {
        if (!this.shape) return;
        let color = this._getShapeColor();
        this.shape.stroke(color);
        this.shape.fill(this._getFillColor());
        if (this._label) {
            let tag = this._label.getTag();
            let tagColor = this.userData.classType || this.userData.modelClass ? color : 'red';
            tag.fill(tagColor);
            tag.stroke(tagColor);
            let text = this._label.getText();
            text.fill('#ffffff');
        }
        this.distanceText && this.distanceText.fill(color);
        if (this.edges.length > 0) {
            this.edges.forEach((edge) => {
                edge.stroke(color);
            });
        }
        this.draw();
    }
    createLabel() {
        let poi = this.points[0];
        if (!poi) return;
        let label = new Konva.Label({
            ...poi,
            name: CONSTANT.LABELNAME,
        });
        let tagColor =
            this.userData.classType || this.userData.modelClass ? this._getShapeColor() : 'red';
        const tag = new Konva.Tag({
            fill: tagColor,
            stroke: tagColor,
            lineJoin: 'round',
            cornerRadius: 4 * this._getScaleFactor(),
            cursor: CURSOR.pointer,
        });
        label.add(tag);
        tag.on('mouseover', () => {
            if (this.view.mode === MODETYPE.edit) {
                this.view.updateCursor(CURSOR.pointer);
            }
        });
        tag.on('mouseout', () => {
            if (this.view.mode === MODETYPE.edit) {
                this.view.updateCursor(CURSOR.auto);
            }
        });
        label.add(
            new Konva.Text({
                text: this.formatLabelText(),
                fontSize: CONSTANT.FONTSIZE * this._getScaleFactor(),
                fill: '#ffffff',
                listening: false,
                lineHeight: 1 * this._getScaleFactor(),
                padding: 4 * this._getScaleFactor(),
                // visible: false,
            }),
        );
        label.getTag().on('click', () => {
            if (this.view.mode === MODETYPE.view && config.isDrawing) {
                return;
            }
            this.view.emit(Event.CLICK_LABEL, {
                data: {
                    object: this,
                },
            });
        });
        this._label = label;
        this._label.owner = this;
        this.helplayer.add(this._label);
        this.updateLabelPosition();
    }
    _calcLabelVisible() {
        if ((config.showLabel || config.showAttr) && this.finish) {
            return this.shape ? this.shape.isVisible() : true;
        } else {
            return false;
        }
    }
    updateLabelPosition() {
        if (!this._label) return;
        let poi = this.points[0];
        let rect = this._label.getTag().getSelfRect();
        if (poi) {
            let offsetX = 0;
            let position = {
                x: poi.x + offsetX,
                y: poi.y - rect.height - 2,
            };
            let bbox = this.view.limitBbox;
            position = limitInBBoxIfNeed(position, bbox, rect, config.limitInBackgroud);
            this._label.position(position);
            this._label.visible(this._calcLabelVisible());
        } else {
            this._label.visible(false);
        }
        this.draw();
    }
    bindDragEvent() {
        this.shape.on('dragstart', () => {
            this.onDragStart();
        });
        this.shape.on('dragmove', (e) => {
            this.view.updateCursor(CURSOR.move);
            this.onDragMove(e);
        });
        this.shape.on('dragend', () => {
            this.view.updateCursor(CURSOR.pointer);
            this.onDragEnd();
        });
        this.shape.on('mouseover', () => {
            if (this.view.mode === MODETYPE.edit) {
                this.view.updateCursor(CURSOR.pointer);
            }
        });
        this.shape.on('mouseout', () => {
            if (this.view.mode === MODETYPE.edit) {
                this.view.updateCursor(CURSOR.auto);
            }
        });
    }
    onDragMove(e) {
        let curPosition = this.shape.position();
        let limitBbox = this.view.limitBbox;
        let rect = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
        if (this.type !== 'point') {
            rect = this.shape.getSelfRect();
        }
        curPosition = limitInBBoxIfNeed(curPosition, limitBbox, rect, config.limitInBackgroud);
        let diff = {
            x: curPosition.x - this.position.x,
            y: curPosition.y - this.position.y,
        };
        // console.log(diff);
        this.shape.position(curPosition);
        this.position = curPosition;
        this.points = this.points.map((point) => {
            return {
                ...point,
                x: point.x + diff.x,
                y: point.y + diff.y,
            };
        });
        this.interior = this.interior.map((ring) => {
            let copyRing = cloneDeep(ring);
            copyRing.points = ring.points.map((point) => {
                return {
                    ...point,
                    x: point.x + diff.x,
                    y: point.y + diff.y,
                };
            });
            return copyRing;
        });
        this.checkValid();
        this.updateShapeColor();
        this.updateAnchors(this.controlPoints || this.points);
        if (this.selected) {
            this.initEdgeEdit();
        }
        this.updateDistanceText();
        this.updateLabelPosition();
    }
    onDragStart() {
        this.position = this.shape.position();
        this.oldPoints = cloneDeep(this.points);
        this.oldInterior = cloneDeep(this.interior);
    }
    onDragEnd() {
        console.log('onDragEnd', this);
        if (this.shape.points) {
            this.shape.points(xytoArr(this.points));
            this.shape.position({ x: 0, y: 0 });
            this.draw();
        }
        this.view.emit(Event.DIMENSION_CHANGE, {
            data: this,
        });
        this.view.editor.cmdManager.execute('move-object', {
            uuid: this.uuid,
            points: cloneDeep(this.points),
            oldPoints: cloneDeep(this.oldPoints),
            // interior: cloneDeep(this.interior),
        });
    }
    // onContextMenu () {
    //     if (this.selected && this.view.mode === MODETYPE.edit) {
    //         this.destroy();
    //     }
    // }
    hide() {
        if (!(this.shape && this._label)) return;
        this.shape.hide();
        this._label.hide();
        this.edges.forEach((edge) => edge.hide());
        this.anchors.forEach((anchor) => anchor.hide());
        this.draw();
    }
    show() {
        if (!(this.shape && this._label)) return;
        this.shape.show();
        this.edges.forEach((edge) => {
            edge.show();
        });
        this.anchors.forEach((anchor) => anchor.show());
        let labelVisible = this._calcLabelVisible();
        this._label.visible(labelVisible);
        this.draw();
    }
    updateLabelText() {
        if (this._label) {
            this._label.getText().text(this.formatLabelText());
            this.updateLabelPosition();
        }
    }
    draw() {
        this.shapelayer.batchDraw();
        this.helplayer.batchDraw();
    }
    getArea() {
        let points = this.points.map((p) => {
            return this._toCoordinate(p);
        });
        let l = points.length;
        let area = 0;
        points = points.concat(points[0]);
        let s = 0;
        for (var i = 0; i < l; i++) {
            s += points[i].x * points[i + 1].y - points[i].y * points[i + 1].x;
        }
        area = Math.abs(s / 2);
        // if (pointsNumber > 2) {
        //     let s = points[0].y * (points[pointsNumber - 1].x - points[1].x);
        //     for (let i = 1; i < pointsNumber; i++) {
        //         s +=
        //             points[i].y *
        //             (points[i - 1].x - points[(i + 1) % pointsNumber].x);
        //     }
        // }
        return area;
    }
    _toCoordinate(p) {
        return toImageCord(p, this.view.limitBbox);
    }
    setVisible(visible) {
        visible ? this.show() : this.hide();
    }
    toJSON() {
        let coordinate = [];
        this.points.forEach((p) => {
            coordinate.push(this._toCoordinate(p));
        });
        this.userData.color = this.stroke;
        return {
            id: this.id,
            type: this.type,
            uuid: this.uuid,
            color: this.stroke,
            visible: this.shape.visible(),
            width: this.width,
            height: this.height,
            area: this.area,
            userData: this.userData,
            strokeWidth: CONSTANT.STROKEWIDTH,
            coordinate,
            _valid: this._valid,
            intId: this.intId,
            _index: this._index,
            lineLength: this.length,
        };
    }
    destroy(notify = false) {
        this.anchors.forEach((anchor) => {
            anchor.off();
            anchor.destroy();
            anchor = null;
        });
        if (this.edges.length) {
            this.edges.forEach((edge) => {
                edge.off();
                edge.destroy();
            });
            this.edges = [];
        }
        this.shape && this.shape.off();
        this.shape.destroy();
        this.shape = null;
        this._label.destroy();
        this.draw();
        let isInmulSelShapes = this.view._isInMulSelection(this);
        this.view.removeShape(this, notify);
        if (isInmulSelShapes) {
            this.view.emit(Event.SELECT, {
                data: {
                    curSelection: Array.from(this.view.mulSelShapes),
                },
            });
        }
        if (this.view.selectedShape === this) {
            this.view.selectedShape = null;
        }
        if (this.view.currentSoloShape === this) {
            this.view.currentSoloShape = null;
        }

        notify &&
            this.view.emit(Event.REMOVE_OBJECT, {
                data: {
                    removed: [this.uuid],
                },
            });
        this.view = null;
        this.shapelayer = null;
        this.helplayer = null;
    }

    translate(direction, distance) {
        console.log('translate', this);
        const selectedShape = this.view?.selectedShape;
        if (!selectedShape) return;

        let diff = { x: 0, y: 0 };
        switch (direction) {
            case 'up':
                diff = { x: 0, y: -distance };
                break;
            case 'down':
                diff = { x: 0, y: distance };
                break;
            case 'left':
                diff = { x: -distance, y: 0 };
                break;
            case 'right':
                diff = { x: distance, y: 0 };
                break;
        }
        this.oldPoints = cloneDeep(this.points);
        this.points = this.points.map((point) => {
            return {
                ...point,
                x: point.x + diff.x,
                y: point.y + diff.y,
            };
        });

        this.oldInterior = cloneDeep(this.interior);
        this.interior = this.interior.map((ring) => {
            const copyRing = cloneDeep(ring);
            copyRing.points = ring.points.map((point) => {
                return {
                    ...point,
                    x: point.x + diff.x,
                    y: point.y + diff.y,
                };
            });
            return copyRing;
        });

        this.view.editor.cmdManager.execute('hotkey-move', {
            uuid: this.uuid,
            points: cloneDeep(this.points),
            interior: cloneDeep(this.interior),
            oldPoints: cloneDeep(this.oldPoints),
        });

        this.setInterior(this.interior);
        this.setPoints(this.points);
        if (this.selected) {
            this.initEdgeEdit();
        }
    }
}
