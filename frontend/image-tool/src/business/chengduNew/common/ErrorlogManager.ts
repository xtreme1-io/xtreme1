import Editor from './Editor';
import Event from '../config/event';
export default class ErrorlogManager {
  private static _instance: ErrorlogManager;
  public static getInstance(): ErrorlogManager {
    if (!this._instance) this._instance = new ErrorlogManager();
    return this._instance;
  }

  editor!: Editor;
  errorList: any[];
  mouseInfo?: MouseEvent;
  constructor() {
    this.errorList = [];
    this.initEvent();
    // @ts-ignore
    window.basicErrorlog = this;
  }
  init(editor: Editor) {
    this.editor = editor;
  }

  initEvent() {
    this.recordError = this.recordError.bind(this);
    window.onerror = this.recordError;
    window.onunhandledrejection = this.recordError;
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
  }
  onMouseMove(e: MouseEvent) {
    this.mouseInfo = { ...e };
  }
  recordError(...infos: any) {
    const errorInfo = this.getBaseInfo(infos);
    this.errorList.push(errorInfo);
    this.editor.emit(Event.ERROR_CONSOLE, errorInfo);
  }
  getBaseInfo(error: any) {
    const { state, bsState } = this.editor;
    const frame = this.editor.getCurrentFrame();
    return {
      datasetId: bsState.datasetId,
      dataId: frame?.id,
      time: new Date(),
      curDrawTool: this.editor.mainView.currentDrawTool?.name,
      curEditTool: this.editor.mainView.currentEditTool?.name,
      mouseInfo: this.mouseInfo,
      toolConfig: state.config,
      taskId: bsState.taskId,
      stage: bsState.stage,
      error,
    };
  }

  getErrors(clearPrevious: boolean = false) {
    const errors = this.errorList;
    if (clearPrevious) this.errorList = [];
    return errors;
  }
}
