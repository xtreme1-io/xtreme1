import Konva from 'konva';
import { SingleImage } from './singleimage';
import ImageLabel from '../index';
import { IPoint } from '../../type';
export class BackGround {
    _layer: Konva.FastLayer;
    content: SingleImage | null;
    view: ImageLabel;
    blur: number;
    brightness: number;
    contrast: number;
    ready: boolean;
    position: IPoint = { x: 0, y: 0 };
    originWidth: number = 0;
    originHeight: number = 0;
    constructor(view: ImageLabel) {
        this._layer = new Konva.Layer({ listening: false });
        this.content = null;
        this.view = view;
        this.view.Stage.add(this._layer);
        this.blur = 1;
        this.brightness = 1;
        this.contrast = 1;
        this.ready = false;
    }
    setBackground(
        image: string | HTMLImageElement,
        onReady: (t: BackGround) => void,
        onError: () => void,
    ) {
        if (this.content) {
            this.content.setImage(
                image,
                (content: SingleImage) => {
                    if (this.view._destoryed) return;
                    this.position = content.image.position();
                    // this._layer.add(content.image);
                    // debugger
                    this._layer.moveToBottom();
                    this.view.Stage.batchDraw();
                    this.ready = true;
                    this.originWidth = content._oriImage.naturalWidth;
                    this.originHeight = content._oriImage.naturalHeight;
                    onReady && onReady(this);
                },
                onError,
            );
        } else {
            this.content = new SingleImage(this.view, this._layer);
            this.content.setImage(
                image,
                (content: SingleImage) => {
                    if (this.view._destoryed) return;
                    this.position = content.image.position();
                    this._layer.moveToBottom();
                    this.view.Stage.batchDraw();
                    this.ready = true;
                    this.originWidth = content._oriImage.naturalWidth;
                    this.originHeight = content._oriImage.naturalHeight;
                    onReady && onReady(this);
                },
                onError,
            );
        }
    }
    checkInImage(point: IPoint) {
        if (this.ready && this.content) {
            return this.content.checkInImage(point);
        }
        return true;
    }
    show() {
        this._layer.show();
    }
    hide() {
        this._layer.hide();
    }
    draw() {
        this._layer.batchDraw();
    }
    clearBackground() {
        if (this.ready && this.content) {
            this.content.destroy();
        }
    }
    resize() {
        if (this.ready && this.content) {
            this.content.resize();
        }
    }
}
