import Editor from '../Editor';
import Event from '../config/event';
import * as THREE from 'three';
import { StatusType } from 'pc-editor';

type IForward = 1 | -1;

interface IPlayOption {
    forward?: IForward;
    interval?: number;
}

export default class PlayManager extends THREE.EventDispatcher {
    editor: Editor;
    forward: IForward = 1;
    interval: number = 300;
    playing: boolean = false;
    timer: number = -1;
    test: number = 1;
    constructor(editor: Editor) {
        super();
        this.editor = editor;

        this.run = this.run.bind(this);
    }
    play(option: IPlayOption = {}) {
        // let { config } = this.editor.state;
        let { forward = 1, interval = this.interval } = option;

        this.dispatchEvent({ type: Event.PLAY_START });
        this.forward = forward;
        this.interval = interval;

        if (this.playing) return;

        // this.editor.state.filterActive = [config.FILTER_ALL];
        this.playing = true;
        this.editor.state.status = StatusType.Play;

        if (this.timer > 0) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(this.run, this.interval) as any;
    }
    stop() {
        if (!this.playing) return;

        this.playing = false;
        this.editor.state.status = StatusType.Default;

        if (this.timer > 0) {
            clearTimeout(this.timer);
            this.timer = -1;
        }
        this.dispatchEvent({ type: Event.PLAY_STOP });
    }
    async next() {
        if (!this.playing) return;

        const { frameIndex, frames } = this.editor.state;
        const toIndex = frameIndex + this.forward;
        const data = frames[toIndex];
        // data.loadState === 'complete'
        if (toIndex < frames.length && toIndex >= 0 && data.loadState === 'complete') {
            try {
                // console.log('toIndex:', toIndex);
                await this.editor.loadFrame(toIndex, false);
                // this.dispatchEvent({ type: Event.PLAY_FRAME_CHANGE });
            } catch (error) {
                this.editor.handleErr(error as any, this.editor.lang('play-error'));
                this.stop();
            }
        } else {
            this.stop();
        }
    }

    async run() {
        // console.log('run:');
        await this.next();

        if (this.playing) {
            this.timer = setTimeout(this.run, this.interval) as any;
        }
    }
}
