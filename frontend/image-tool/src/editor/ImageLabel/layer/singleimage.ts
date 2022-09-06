import Konva from 'konva';
import { computeScaleDim, isGreatOrEqual, isLessOrEqual } from '../util';
import { IPoint, IDim } from '../../type';
import ImageLabel from '../index';
export class SingleImage {
    view: ImageLabel;
    _centered: boolean;
    image?: Konva.Image | null;
    _destoryed: boolean;
    layer: Konva.FastLayer;
    dim?: IDim = { x: 0, y: 0, width: 0, height: 0, scale: 0 };
    _oriImage?: HTMLImageElement | null | undefined;
    constructor(view: ImageLabel, layer: Konva.FastLayer) {
        this.view = view;
        this._centered = false;
        this.image = null;
        this._destoryed = false;
        this.layer = layer;
    }
    checkInImage(point: IPoint) {
        let imagepos = this.image?.position() as IPoint;
        let dim = this.dim;
        let isInImage = false;
        if (
            isGreatOrEqual(point.x, imagepos.x) &&
            isLessOrEqual(point.x, imagepos.x + dim.width) &&
            isGreatOrEqual(point.y, imagepos.y) &&
            isLessOrEqual(point.y, imagepos.y + dim.height)
        ) {
            isInImage = true;
        }
        return isInImage;
    }
    getClientRect() {
        if (this.image) {
            return this.image.getClientRect();
        }
    }
    setImage(
        image: HTMLImageElement | string,
        onLoad: (t: SingleImage) => void,
        onError: (t: SingleImage) => void,
    ) {
        this._destoryed = false;
        if (image instanceof HTMLImageElement) {
            this._oriImage = image;
            this._setImage(this._oriImage);
            setTimeout(() => {
                if (this._destoryed) return;
                onLoad && onLoad(this);
            });
        } else if (typeof image === 'string') {
            let img = document.createElement('img');
            img.src = image;
            this._oriImage = img;
            if (~image.indexOf('api.') || ~image.indexOf('data:image')) {
                img.crossOrigin = 'anonymous';
            }
            img.onload = () => {
                if (this._destoryed) return;
                this._setImage(this._oriImage as HTMLImageElement);
                onLoad && onLoad(this);
            };
            img.onerror = () => {
                if (this._destoryed) return;
                onError && onError(this);
            };
        }
    }
    _setImage(image: HTMLImageElement) {
        if (this.image) {
            this.image.image(image);
            this.layer.add(this.image);
            this.resize();
        } else {
            this.image = new Konva.Image({
                image,
            });
            this.layer.add(this.image);
            this.resize();
        }
    }
    _center() {
        let bbox = this.view.bbox;
        let dim = this.dim as IDim;
        let pos = {
            x: Math.round((bbox.width - dim.width) / 2),
            y: Math.round((bbox.height - dim.height) / 2),
        };
        if (this.image) {
            this.image.position(pos);
        }

        this.dim = {
            ...this.dim,
            ...pos,
        } as IDim;
        this.view.limitBbox = this.dim;
        this.layer.batchDraw();
    }
    setScale(scale: number) {
        if (this._oriImage) {
            this.dim = {
                width: this._oriImage.width * scale,
                height: this._oriImage.height * scale,
                scale: scale,
                x: 0,
                y: 0,
            };
            if (this.image) {
                this.image.size(this.dim);
            }
        }
    }
    resize() {
        let ret = computeScaleDim(this._oriImage, this.view.bbox);
        this.dim = ret as IDim;
        this.setScale(this.dim.scale);
        this._center();
    }
    destroy() {
        this._destoryed = true;
        if (this.image) {
            this.image.remove();
        }
        if (this._oriImage) {
            this._oriImage.onload = this._oriImage.onerror = null;
        }
        this._oriImage = null;
    }
}
