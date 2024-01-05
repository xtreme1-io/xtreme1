import EventEmitter from 'eventemitter3';
import Editor from '../Editor';
import { Event } from '../configs';
import { StatusType } from '../types';

type IForward = 1 | -1;
interface IPlayOption {
  forward?: IForward;
  interval?: number;
}

export default class PlayManager extends EventEmitter {
  private static _instance: PlayManager;
  public static get instance(): PlayManager {
    if (!this._instance) this._instance = new PlayManager();
    return this._instance;
  }

  editor!: Editor;
  playing: boolean = false;
  interval: number = 300;
  forward: IForward = 1;
  timer: number = -1;
  constructor() {
    super();
    this.run = this.run.bind(this);
  }
  init(editor: Editor) {
    this.editor = editor;
  }
  play(option: IPlayOption = {}) {
    const { forward = 1, interval = this.interval } = option;
    this.emit(Event.PLAY_START);
    this.forward = forward;
    this.interval = interval;

    if (this.playing) return;
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
    this.emit(Event.PLAY_STOP);
  }
  async next() {
    if (!this.playing) return;

    const { frameIndex, frames } = this.editor.state;
    const toIndex = frameIndex + this.forward;
    const data = frames[toIndex];
    // data.loadState === 'complete'
    if (toIndex < frames.length && toIndex >= 0 && data.loadState === 'complete') {
      try {
        console.log('play next toIndex:', toIndex);
        await this.editor.loadFrame(toIndex, false);
        this.emit(Event.PLAY_FRAME_CHANGE);
      } catch (error) {
        this.editor.handleErr(error as any, this.editor.lang('play-error'));
        this.stop();
      }
    } else {
      console.log('play next stop:', toIndex);
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
