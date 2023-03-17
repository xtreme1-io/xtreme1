import uuid from 'uuid/v4';
import { Editor } from 'editor';
import { IPoint, IDim, StatusType } from '../type';
import Konva from 'konva';
import EventEmitter from 'eventemitter3';
import { BackGround } from './layer/background';
import Shape from './region/shape_index';
import ShapeList from './region/shapelist';
import { ToolManager } from './tools/toolmanager';
import { Event } from '../config/event';
import elementResizeDetectorMaker from 'element-resize-detector';
import DomEventHandle from './domeventhandle';
import BisectrixLine from './helper/bisectrixline';
import _ from 'lodash';
import polygonClip from 'polygon-clipping';

import hotkeys from 'hotkeys-js';
import hotkeyConfig, { drawingConfig } from '../config/hotkey';
import { UITypeEnum } from '../../enum/UITypeEnum';

let erd = elementResizeDetectorMaker();
import {
    SHAPESELCTOR,
    MODETYPE,
    SHAPEANCHORSELECTOR,
    CURSOR,
    SELECTEDSELECTOR,
    HIGHLIGHTEDSELECTOR,
    SHAPENAME,
    updateShapeScale,
    getMaxIntId,
    CONSTANT,
    updateLabelVisibility,
    KeyCodeMap,
    updateShapeMask,
    polygonContains,
    getSelectedShapByCurrentTool,
} from './util';
import { config } from './config';
import { UIType } from '../config/mode';
interface ICtorOption {
    container: HTMLElement;
}

interface IBBOX {
    width: number;
    height: number;
}
export class ImageLabel extends EventEmitter {
    background: BackGround;
    Shape: Shape;
    Stage: Konva.Stage;
    mode: string;
    container: HTMLElement;
    canvasContainer: HTMLDivElement;
    scalefactor: number;
    rotation: number;
    mousePos: IPoint;
    shapes: ShapeList;
    shapeIntId: number;
    bbox: IBBOX;
    panning: boolean;
    _destoryed: boolean;
    limitBbox: IDim;
    shapelayer: Konva.Layer;
    helplayer: Konva.Layer;
    toolmanager: ToolManager;
    mouseDown: boolean = false;
    ready: boolean = false;
    mulSelShapes: Set<keyof Shape> = new Set();
    editor: Editor;
    bisectrixLine: BisectrixLine;
    selectedShape: any;
    activeAnchor: any;
    constructor(public opt: ICtorOption, editor: Editor) {
        super();
        this.editor = editor;
        this.mode = MODETYPE.view;
        this.container = this.opt.container;
        this.container.innerHTML = `<div class="shape-container" style="height:100%;"></div>`;
        this.canvasContainer = this.container.querySelector('.shape-container') as HTMLDivElement;
        this.container.style.position = 'relative';
        this.canvasContainer.style.backgroundColor = config.backgroudColor;
        this.canvasContainer.focus();
        this.scalefactor = 1;
        this.rotation = 0;
        this.mousePos = { x: 0, y: 0 };
        this.panning = false;
        this.shapes = new ShapeList(this);
        this.Shape = Shape;
        this.shapeIntId = 1;
        this._destoryed = false;
        let bbox = this.container.getBoundingClientRect() as IBBOX;
        this.bbox = {
            width: Math.ceil(bbox.width),
            height: Math.ceil(bbox.height),
        };
        this.Stage = new Konva.Stage({
            container: this.canvasContainer,
            width: this.bbox.width,
            height: this.bbox.height,
            offset: {
                x: this.bbox.width / 2,
                y: this.bbox.height / 2,
            },
            x: this.bbox.width / 2,
            y: this.bbox.height / 2,
        });
        this.shapelayer = new Konva.Layer();
        this.helplayer = new Konva.Layer();
        this.Stage.add(this.shapelayer, this.helplayer);
        this.limitBbox = {
            width: 0,
            height: 0,
            scale: 1,
        } as IDim;
        this.toolmanager = new ToolManager(this);
        this.background = new BackGround(this);
        this.bisectrixLine = new BisectrixLine(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.bindDomEvent();
        this.resize = _.throttle(this.resize.bind(this), 100, {
            trailing: true,
        });
        erd.listenTo({ callOnAdd: false }, this.container, () => {
            this.resize();
        });
        this.selectedShape = null;

        this.bindHotkey();
    }
    resize() {
        let bbox = this.container.getBoundingClientRect();
        this.bbox = {
            width: bbox.width,
            height: bbox.height,
        };
        this.bbox.width = Math.ceil(this.bbox.width);
        this.Stage.size(this.bbox);
        this.Stage.position({
            x: this.bbox.width / 2,
            y: this.bbox.height / 2,
        });
    }
    setBackground(
        image: string | HTMLImageElement,
        onBackgroundReady: (t: BackGround) => void,
        onBackgroundError: () => void,
    ) {
        this.clearBackground();
        this.background.setBackground(
            image,
            () => {
                this.ready = true;
                this.bisectrixLine.render();
                onBackgroundReady(this.background);
            },
            () => {
                onBackgroundError();
            },
        );
    }
    clearBackground() {
        this.background.clearBackground();
        this.Stage.batchDraw();
    }

    updateCursor(cursor: string) {
        if (this.canvasContainer) {
            this.canvasContainer.style.cursor = cursor;
        }
    }
    setDrawingState(state: boolean) {
        config.isDrawing = state;
    }
    _clearMulSelection() {
        this.selectedShape = null;
        this.mulSelShapes.clear();
    }
    _isInMulSelection(item: any) {
        return this.mulSelShapes.has(item);
    }
    _removeMulSelectionItem(item: any) {
        this.mulSelShapes.delete(item);
    }
    _addMulSelectionItem(item: any) {
        this.mulSelShapes.add(item);
    }
    unSelectAll(notify = false) {
        this._clearMulSelection();
        this.Stage.find(SELECTEDSELECTOR + ',' + HIGHLIGHTEDSELECTOR).forEach((obj: any) => {
            if (obj.owner) {
                let shape = obj.owner;
                shape = shape.parent || shape;
                shape.selectShape(false);
                shape.highLight(false);
            }
        });
    }

    resetZoom() {
        let position = {
            x: this.bbox.width / 2,
            y: this.bbox.height / 2,
        };
        this.Stage.position(position);
        this.zoomTo(1, false);
    }
    zoom(delta: number, relativeMouse: boolean = true) {
        this.zoomTo(this.scalefactor + delta, relativeMouse);
    }
    zoomTo(scale: number, relativeMouse = true) {
        this.scalefactor = scale;
        let stage = this.Stage;
        if (relativeMouse) {
            // https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html
            let oldScale = stage.scaleX();
            let pointer = {
                x: stage.width() / 2,
                y: stage.height() / 2,
            };
            pointer = stage.getPointerPosition() || pointer;
            let mousePointTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            };
            let newScale = this.scalefactor;
            let newPos = {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            };
            this.Stage.position(newPos);
        }
        // updateShapeScale(this);
        this.Stage.scale({
            x: this.scalefactor,
            y: this.scalefactor,
        });
        updateShapeScale(this);
        this.Stage.batchDraw();
        let limitBbox = this.limitBbox;
        // console.log('zoom: ->', limitBbox.scale * this.scalefactor);
        this.emit(Event.ZOOM_CHANGE, {
            data: limitBbox.scale * this.scalefactor,
        });
    }
    setMode(mode: string) {
        if (mode in MODETYPE) {
            this.mode = mode;
            let shapes = this.Stage.find(SHAPESELCTOR);
            switch (this.mode) {
                case MODETYPE.draw: {
                    shapes.forEach((shape) => {
                        shape.draggable(false);
                    });
                    if (this.selectedShape) {
                        let current = this.selectedShape;
                        this.unSelectAll();
                        this._addMulSelectionItem(current);
                        current.highLight(true);
                        current.selectShape(true);
                    }
                    break;
                }
                case MODETYPE.edit: {
                    shapes.forEach((shape) => {
                        shape.draggable(true);
                    });
                    if (this.selectedShape) {
                        let current = this.selectedShape;
                        this.unSelectAll();
                        this._addMulSelectionItem(current);
                        current.highLight(true);
                        current.selectShape(true);
                    }
                    break;
                }
            }

            this.Stage.batchDraw();
        }
    }
    // Event Handler
    onMouseWheel(e: Konva.KonvaEventObject<WheelEvent>) {
        e.evt.preventDefault();
        e.evt.stopPropagation();
        let delta = (e.evt as any).wheelDelta ? (e.evt as any).wheelDelta : e.evt.deltaY * -40;
        let scale = this.scalefactor + delta * 0.002;
        let limitBbox = this.limitBbox;
        let imageScale = limitBbox.scale * scale;
        if (imageScale < 0.2 || imageScale > 10) return;
        this.zoomTo(scale);
    }
    onContextMenu(e: Konva.KonvaEventObject<MouseEvent>) {
        let evt = e.evt;
        evt.preventDefault();
        this.toolmanager.event('contextmenu', e, this.getRelativePointerPosition());
    }
    onMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
        let evt = e.evt;
        let target = e.target;
        this.updateMousePosition();
        this.mouseDown = true;
        if (!this.ready) return;
        if (evt.button === 1 || config.spaceKeyIsPressed) {
            evt.preventDefault();
            this.Stage.find(SHAPEANCHORSELECTOR).forEach((shape) => {
                shape.draggable(false);
            });
            this.panning = true;
            this.updateCursor(CURSOR.grab);
            return;
        }
        let position = this.getRelativePointerPosition();
        if (target instanceof Konva.Tag) return;
        if (evt.button === 0) {
            if (this.mode !== MODETYPE.draw) {
                if (target === this.Stage) {
                    this.unSelectAll();
                    return;
                }
                if (!target.hasName(SHAPENAME)) return;
                let current = (target as any).owner;
                if (!evt.shiftKey) {
                    this.unSelectAll();
                }
                if (this._isInMulSelection(current)) {
                    this._removeMulSelectionItem(current);
                    current.selectShape(false);
                    current.highLight(false);
                } else {
                    this._addMulSelectionItem(current);
                    // Array.from(this.mulSelShapes).forEach((shape) => {
                    //     shape.selectShape(false);
                    // });
                    current.selectShape(true);
                }
            }
        }
        this.toolmanager.event('mousedown', e, position);
    }
    onMouseUp(e: Konva.KonvaEventObject<MouseEvent>) {
        if (!this.ready) return;
        this.mouseDown = false;
        if (this.mode === MODETYPE.edit) {
            this.Stage.find(SHAPEANCHORSELECTOR).forEach((shape) => {
                shape.draggable(true);
            });
        }
        this.panning = false;
        this.updateCursor(CURSOR.auto);
        this.updateMousePosition();
        this.toolmanager.event('mouseup', e, this.getRelativePointerPosition());
    }
    onMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
        if (!this.ready || this._destoryed) return;
        let pos = this.Stage.getPointerPosition() || this.mousePos;
        let absPos = this.getRelativePointerPosition();
        if (this.panning) {
            this.updateCursor(CURSOR.grabbing);
            let diff = {
                x: pos.x - this.mousePos.x,
                y: pos.y - this.mousePos.y,
            };
            let posi = this.Stage.position();
            this.Stage.position({
                x: posi.x + diff.x,
                y: posi.y + diff.y,
            });
            this.Stage.batchDraw();
        } else {
            this.toolmanager.event('mousemove', e, absPos);
        }
        this.mousePos = pos;
    }
    onKeyDown(e: KeyboardEvent) {
        let target = e.target as HTMLElement;
        if (
            target.tagName.toLowerCase() === 'input' ||
            target.tagName.toLowerCase() === 'textarea'
        ) {
            return;
        }
    }
    onKeyUp(e: KeyboardEvent) {
        let target = e.target as HTMLElement;
        if (
            target.tagName.toLowerCase() === 'input' ||
            target.tagName.toLowerCase() === 'textarea'
        ) {
            return;
        }
        let keyCode = e.which || e.keyCode;
        switch (keyCode) {
            case KeyCodeMap.SPACE: {
                DomEventHandle.KeySpaceUp.call(this, config);
                break;
            }
        }
    }
    bindHotkey() {
        drawingConfig.forEach((item) => {
            hotkeys(item.key, { keyup: true }, (event, handler) => {
                if (this.editor.state.showKeyboard) return;

                if (event.type === 'keydown') {
                    DomEventHandle[item.action].call(this, config, event);
                } else if (event.type === 'keyup') {
                    item.upAction && DomEventHandle[item.upAction].call(this, config, event);
                }
            });
        });

        const excludes = ['⌘ + z', '⌘ + Shift + z', 'Ctrl + z', 'Ctrl + Shift + z'];
        const interactiveExcludes = ['Delete', 'Backspace'];
        hotkeyConfig.forEach((config) => {
            hotkeys(config.key, () => {
                if (this.editor.state.showKeyboard) return;
                if (this.editor.state.status != StatusType.Create) return;

                console.log(this);
                if (
                    this.mode == MODETYPE.edit &&
                    this.toolmanager?.currentTool?.name == UITypeEnum.interactive
                ) {
                    if (interactiveExcludes.includes(config.key)) this.editor.handleDelete();
                    else this.editor.showMsg('error', 'Please finish drawing first');
                    return;
                }

                if (!excludes.includes(config.key)) {
                    this.editor.showMsg('error', 'Please finish drawing first');
                }
            });
        });
    }
    _onWindowBlur() {
        DomEventHandle.KeySpaceUp.call(this, config);
    }
    getRelativePointerPosition(point?: IPoint) {
        let node = this.Stage;
        const transform = node.getAbsoluteTransform().copy();
        transform.invert();
        return transform.point(point || node.getPointerPosition() || this.mousePos);
    }
    updateMousePosition() {
        this.mousePos = this.Stage.getPointerPosition() || this.mousePos;
    }
    unBindDomEvent() {
        this.Stage.off('wheel mousedown dbclick mousemove mouseup contextmenu');
        window.removeEventListener('keydown', this.onKeyDown, true);
        window.removeEventListener('keyup', this.onKeyUp);
        // window.removeEventListener('mousemove', this._onMousemove);
        window.removeEventListener('blur', this._onWindowBlur);
    }
    bindDomEvent() {
        this.unBindDomEvent();
        this.Stage.on('wheel', this.onMouseWheel.bind(this));
        this.Stage.on('mousedown', this.onMouseDown.bind(this));
        // this.Stage.on('dblclick', this.onDblClick.bind(this));
        this.Stage.on('mousemove', this.onMouseMove.bind(this));
        // this.Stage.on('mouseenter', this.onMouseEnter.bind(this));
        // this.Stage.on('mouseleave', this.onMouseLeave.bind(this));
        this.Stage.on('mouseup', this.onMouseUp.bind(this));
        this.Stage.on('contextmenu', this.onContextMenu.bind(this));
        window.addEventListener('keydown', this.onKeyDown, true);
        window.addEventListener('keyup', this.onKeyUp);
        // window.addEventListener('mousemove', this._onMousemove);
        window.addEventListener('blur', this._onWindowBlur);
    }
    addShape(shape: any) {
        this.shapes.add(shape);
        this._needUpdateShapeIntId(shape.intId);
    }
    _needUpdateShapeIntId(intId: number) {
        if (this.shapeIntId <= intId) {
            this.shapeIntId++;
        }
    }
    removeShape(shape: any) {
        this._removeMulSelectionItem(shape);
        this.shapes.remove(shape);
        if (this.shapes.length === 0) {
            this.shapeIntId = 1;
        }
    }
    fromJSON(data: any) {
        // console.log(data);
        this.shapeIntId = Math.max(getMaxIntId(data), this.shapeIntId);
        data.forEach((item: any) => {
            if (Shape[item.type]) {
                Shape[item.type].fromJSON(this, item);
            }
        });
        this.emit(Event.LOAD_OBJECTS, {
            data: {
                objects: data,
            },
        });
        setTimeout(() => {
            console.log('fromJSON', this.editor.state.focusId);
            if (this.editor.state?.focusId) {
                const focusShape = data.find(
                    (item: any) => item.intId == this.editor.state?.focusId,
                );
                console.log(focusShape);
                if (focusShape.uuid) {
                    this.selectShapeById(focusShape.uuid + '');
                }
            }
        }, 300);
    }
    toJSON() {
        let data: any = [];
        let { list, group } = this.shapes.getFlatListAndGroupInfo();
        if (!this.ready) {
            return [];
        }
        list.forEach((shape: any) => {
            let shapeData = shape.toJSON();
            data.push(shapeData);
        });
        return data.sort((a, b) => a.intId - b.intId);
    }
    clear() {
        if (config.isDrawing) {
            return false;
        }
        this.clearBackground();
        this.removeAll(false);
        this.setDrawingState(false);
        // delAllShape(this, notify);
        if (this.shapes.size === 0) {
            this.shapeIntId = 1;
        }
    }
    removeAll(notify = true) {
        this.toolmanager.cancel();
        this.unSelectAll();
        this.shapes.forEach((shape: any) => {
            if (shape) {
                shape.destroy(false);
            }
        });
        this.Stage.batchDraw();
        notify && this.emit(Event.CLEAR_DATA);
    }
    selectTool(toolName: any) {
        this.toolmanager.selectTool(toolName);
    }
    addTool(Tool: any) {
        let tool = new Tool(this);
        this.toolmanager.addTool(tool);
    }
    _getShapePosition(shape: any) {
        return shape.getAbsolutePosition();
    }
    selectShapeById(id: string, multiple = false) {
        multiple = this.mode === MODETYPE.edit && multiple;
        let ids = id.split(',');
        ids.forEach((id) => {
            let shape = this.shapes.getItemById(id);
            if (shape) {
                shape.show();
                // if (!config.soloMode) {
                if (!multiple) {
                    this.unSelectAll();
                }
                if (this._isInMulSelection(shape)) {
                    this._removeMulSelectionItem(shape);
                    shape.selectShape(false);
                    shape.highLight(false);
                } else {
                    // Array.from(this.mulSelShapes).forEach((shape) => {
                    //     shape.selectShape(false);
                    //     shape.highLight(true);
                    // });
                    this._addMulSelectionItem(shape);
                    shape.selectShape(true);
                }
            }
        });
    }
    removeById(id: string | string[]) {
        if (this.mode === MODETYPE.view) return;
        let ids = Array.isArray(id) ? id : [id];
        ids.forEach((id) => {
            let shape = this.shapes.getItemById(id);
            let currentTool = this.toolmanager.currentTool;
            if (currentTool && currentTool.poly && currentTool.poly === shape) {
                currentTool.poly = null;
            }
            if (shape) {
                shape.destroy();
            }
        });
        if (ids.length > 0) {
            this.emit(Event.REMOVE_OBJECT, {
                data: {
                    removed: ids,
                },
            });
        }
    }
    _getAllShape() {
        return this.shapes.toArray();
    }
    updateShapeStyle({ fillalpha, strokeWidth }) {
        config.fillalpha = fillalpha;
        CONSTANT.STROKEWIDTH = strokeWidth;
        CONSTANT.HITSTROKEWIDTH = CONSTANT.STROKEWIDTH * 2;
        updateShapeScale(this);
        this.Stage.find('.shape').forEach((shape) => {
            shape.owner.updateShapeColor();
        });
    }
    toggleLabel(showLabel: boolean) {
        config.showLabel = showLabel;
        updateLabelVisibility(this);
    }
    toggleMask(viewtype: string) {
        config.isShowMask = viewtype === 'mask';
        if (config.isShowMask) {
            this.background.hide();
            this.canvasContainer.style.backgroundColor = config.maskgroudColor;
        } else {
            this.background.show();
            this.canvasContainer.style.backgroundColor = config.backgroudColor;
        }
        updateShapeMask(this.shapelayer);
    }
    setVisible(ids: string[], visible: boolean) {
        if (ids.length === 0) {
            let shapes = this._getAllShape();
            shapes.forEach((shape) => {
                shape.setVisible(visible);
            });
        } else {
            ids.forEach((id) => {
                let shape = this.shapes.getItemById(id);
                if (shape) {
                    shape.setVisible(visible);
                }
            });
        }
        this.emit(Event.VISIBLE_CHANGE);
    }
    addInteriorToShape() {
        if (this.mulSelShapes.size > 1) {
            let [shape, ...interiors] = Array.from(this.mulSelShapes);
            if (shape.type !== 'polygon') {
                this.editor.showMsg(
                    'warning',
                    'The selected object does not meet the hollowing condition',
                );
                return;
            }
            let filterRing = interiors.filter((ring) => {
                return (
                    ring.type === 'polygon' &&
                    ring.interior.length === 0 &&
                    polygonContains(shape, ring)
                );
            });
            if (filterRing.length === 0) {
                this.editor.showMsg(
                    'warning',
                    'The selected object does not meet the hollowing condition',
                );
                return;
            }
            if (interiors.length > filterRing.length) {
                this.editor.showMsg('warning', 'Some selected objects have been hollowed out');
            }
            shape.addInterior(filterRing);
            this.selectShapeById(shape.uuid);
        }
    }
    removeInterior() {
        let shapes = Array.from(this.mulSelShapes);
        let polygons = shapes.filter((shape) => {
            return shape.type === 'polygon' && shape.interior.length > 0;
        });
        if (polygons.length) {
            polygons.forEach((polygon) => {
                polygon.removeInterior();
            });
        } else {
            this.editor.showMsg('warning', 'This result cannot cancel hollowing');
        }
    }
    clipPolygon(firstisClip: boolean = true) {
        let diff = {
            removed: [],
            add: [],
        };
        if (this.mulSelShapes.size > 1) {
            let [shape, ...othershapes] = Array.from(this.mulSelShapes);
            let otherPolygon = othershapes.filter((shape) => {
                return shape.type === 'polygon' && shape.interior.length === 0;
            });
            let filterPolygon = otherPolygon.filter((ring) => {
                return !(polygonContains(shape, ring) || polygonContains(ring, shape));
            });
            if (
                otherPolygon.length === 0 ||
                filterPolygon.length === 0 ||
                shape.type !== 'polygon'
            ) {
                this.editor.showMsg(
                    'warning',
                    'The selected object does not meet the clipping condition',
                );
                return;
            }
            if (otherPolygon.length > filterPolygon.length) {
                this.editor.showMsg('warning', 'Some of the selected objects have been clipped');
            }
            if (firstisClip) {
                let cliped = [shape.points.map((t) => [t.x, t.y])];
                filterPolygon.forEach((clip) => {
                    let clipPoints = [clip.points.map((t) => [t.x, t.y])];
                    cliped = polygonClip.difference(cliped, clipPoints);
                });
                let config = shape.toJSON();
                shape.destroy();
                diff.removed.push(config);
                cliped.forEach((points) => {
                    let polygon = new Shape['polygon'](this, {
                        ...config,
                        uuid: uuid(),
                        intId: this.shapeIntId,
                        points: points[0].map((p) => {
                            return {
                                x: p[0],
                                y: p[1],
                            };
                        }),
                        finish: true,
                        fromJson: true,
                    });
                    diff.add.push(polygon.toJSON());
                });
            } else {
                let clipPoints = [shape.points.map((t) => [t.x, t.y])];
                filterPolygon.forEach((clip) => {
                    let config = clip.toJSON();
                    let cliped = [clip.points.map((t) => [t.x, t.y])];
                    cliped = polygonClip.difference(cliped, clipPoints);
                    clip.destroy();
                    diff.removed.push(config);
                    cliped.forEach((points) => {
                        let polygon = new Shape['polygon'](this, {
                            ...config,
                            uuid: uuid(),
                            intId: this.shapeIntId,
                            points: points[0].map((p) => {
                                return {
                                    x: p[0],
                                    y: p[1],
                                };
                            }),
                            finish: true,
                            fromJson: true,
                        });
                        diff.add.push(polygon.toJSON());
                    });
                });
            }
            this.unSelectAll();
        }
        this.editor.cmdManager.execute('clip-ploygon', {
            object: this,
            diff: diff,
        });
        return diff;
    }
    destroy() {
        this.unBindDomEvent();
        this.clearBackground();
        this.toolmanager.destroy();
        this.toolmanager = null;
        this.Stage.destroy();
        // this._toolbarUnbind();
        erd.uninstall(this.container);
        this.container.innerHTML = '';
        this._destoryed = true;
        this.removeAllListeners();
    }
}
