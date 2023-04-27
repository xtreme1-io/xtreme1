import * as THREE from 'three';
import MainRenderView from '../renderView/MainRenderView';
import Action from './Action';
import Box from '../objects/Box';
import * as _ from 'lodash';

interface Point {
    x: number;
    y: number;
}

type ICallback = (data: any) => void;

const TypePoints = {
    'points-1': 1,
    'points-3': 3,
    'box-2': 4,
    box: 2,
};

type DrawType = keyof typeof TypePoints;

interface IStartOption {
    type: DrawType;
    trackLine?: boolean;
    startClick?: boolean;
    startMouseDown?: boolean;
}

export default class CreateAction extends Action {
    static actionName: string = 'create-obj';
    renderView: MainRenderView;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    points: Point[] = [];
    raycaster: THREE.Raycaster;
    drawType: DrawType = 'points-3';
    startClick: boolean = true;
    startMouseDown: boolean = false;
    trackLine: boolean = false;
    callback: ICallback | undefined | null = null;
    onChange: ICallback | undefined | null = null;
    constructor(renderView: MainRenderView) {
        super();

        this.renderView = renderView;
        this.raycaster = new THREE.Raycaster();

        let canvas = document.createElement('canvas');
        canvas.className = 'create-obj';
        canvas.style.position = 'absolute';
        canvas.style.left = '0px';
        canvas.style.top = '0px';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'none';
        canvas.style.cursor = 'crosshair';

        let context = canvas.getContext('2d') as any;

        this.canvas = canvas;
        this.context = context;

        this.onClick = this.onClick.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);

        this.drawBox = _.throttle(this.drawBox.bind(this), 30);
        this.drawPoint3 = _.throttle(this.drawPoint3.bind(this), 30);
        // this.toggle(false);
    }

    init() {
        let dom = this.renderView.container;
        dom.appendChild(this.canvas);
        // this.start();
        this.canvas.addEventListener('click', this.onClick);
        this.canvas.addEventListener('mousedown', this.onMouseDown);
        this.canvas.addEventListener('mouseup', this.onMouseUp);
        this.canvas.addEventListener('mousemove', this.onMouseMove);
    }

    destroy() {
        this.canvas.removeEventListener('click', this.onClick);
        this.canvas.removeEventListener('mousedown', this.onMouseDown);
        this.canvas.removeEventListener('mouseup', this.onMouseUp);
        this.canvas.removeEventListener('mousemove', this.onMouseMove);
    }

    start(option: IStartOption, callback: ICallback, onChange?: ICallback) {
        if (this.canvas.style.display === 'block') return;

        let {
            type = 'points-3',
            trackLine = false,
            startClick = true,
            startMouseDown = false,
        } = option;

        this.drawType = type;
        this.trackLine = trackLine;
        this.startClick = startClick;
        this.startMouseDown = startMouseDown;
        // this.toggle(true);
        this.callback = callback;
        this.onChange = onChange;

        this.canvas.style.display = 'block';
        this.points = [];

        this.clear();
    }

    end() {
        this.canvas.style.display = 'none';
    }

    setStyle() {
        let context = this.context;
        context.setLineDash([]);
        context.lineWidth = 1;

        context.strokeStyle = '#fcff4b';
        context.fillStyle = '#fcff4b';

        // switch (this.drawType) {
        //     case 'points-3':
        //         context.strokeStyle = '#fcff4b';
        //         context.fillStyle = '#fcff4b';
        //         break;
        //     case 'box':
        //         context.strokeStyle = '#fcff4b';
        //         context.fillStyle = '#fcff4b';
        //         break;
        // }
    }

    clear() {
        let context = this.context;

        if (
            this.canvas.width !== this.canvas.clientWidth ||
            this.canvas.height !== this.canvas.clientHeight
        ) {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
        }

        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawTrackLine(pos: Point) {
        let context = this.context;
        let { width, height } = this.canvas;

        // context.beginPath();
        context.fillStyle = 'red';
        context.strokeStyle = 'red';
        context.lineWidth = 1;
        context.beginPath();
        context.setLineDash([2, 2]);

        context.moveTo(0, pos.y);
        context.lineTo(width, pos.y);

        context.moveTo(pos.x, 0);
        context.lineTo(pos.x, height);
        context.stroke();

        context.setLineDash([]);
    }

    drawPoint3(pos: Point) {
        let context = this.context;

        this.clear();

        if (this.trackLine) this.drawTrackLine(pos);

        context.beginPath();
        this.setStyle();

        this.points.forEach((p, index) => {
            if (index === 0) context.moveTo(p.x, p.y);
            else context.lineTo(p.x, p.y);
        });

        if (this.points.length > 0) context.lineTo(pos.x, pos.y);
        else {
            this.drawPointer(pos);
        }

        context.stroke();
    }

    drawBox(pos: Point) {
        let context = this.context;

        this.clear();
        if (this.trackLine) this.drawTrackLine(pos);

        context.beginPath();
        this.setStyle();

        if (this.points.length > 0) {
            let point = this.points[0];
            this.context.strokeRect(pos.x, pos.y, point.x - pos.x, point.y - pos.y);
        } else {
            this.drawPointer(pos);
        }

        context.stroke();
    }

    drawBox2(pos: Point) {
        let context = this.context;

        this.clear();
        if (this.trackLine) this.drawTrackLine(pos);

        context.beginPath();
        this.setStyle();
        let len = this.points.length;
        if (len > 0) {
            if (len >= 2) {
                let p1 = this.points[0];
                let p2 = this.points[1];
                this.context.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
            }

            if (len === 1 || len === 3) {
                let point = len === 1 ? this.points[0] : this.points[2];
                this.context.strokeRect(pos.x, pos.y, point.x - pos.x, point.y - pos.y);
            }
        }

        if (len === 0 || len === 2) {
            this.drawPointer(pos);
        }

        context.stroke();
    }

    drawPointer(pos: Point) {
        this.context.fillRect(pos.x - 3, pos.y - 3, 6, 6);
    }

    onMouseMove(event: MouseEvent) {
        event.stopPropagation();
        let pos = { x: event.offsetX, y: event.offsetY };
        switch (this.drawType) {
            case 'points-1':
            case 'points-3':
                // console.time('test-3');

                this.drawPoint3(pos);
                // console.timeEnd('test-3');

                break;
            case 'box':
                // console.time('test-box');

                this.drawBox(pos);
                // console.timeEnd('test-box');

                break;
            case 'box-2':
                // console.time('test-box');

                this.drawBox2(pos);
                // console.timeEnd('test-box');

                break;
        }
    }

    handleCallback() {
        if (this.callback) {
            this.callback(this.points);
        }
    }

    onMouseUp(event: MouseEvent) {
        event.stopPropagation();
        if (!this.enabled || !this.startMouseDown) return;
        this.handleMouse(event);
    }

    onMouseDown(event: MouseEvent) {
        event.stopPropagation();
        if (!this.enabled || !this.startMouseDown) return;
        this.handleMouse(event);
    }

    onClick(event: MouseEvent) {
        event.stopPropagation();
        if (!this.enabled || !this.startClick) return;
        this.handleMouse(event);
    }

    handleMouse(event: MouseEvent) {
        this.points.push({ x: event.offsetX, y: event.offsetY });

        if (this.onChange) this.onChange(this.points);

        if (this.points.length >= TypePoints[this.drawType]) {
            this.end();
            this.handleCallback();
        }
    }
}
