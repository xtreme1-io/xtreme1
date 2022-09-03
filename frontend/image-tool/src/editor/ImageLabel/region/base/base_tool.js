import { getScaleFactor } from '../../util';
export class BaseTool {
    constructor(view) {
        this.view = view;
        this.helplayer = view.helplayer;
        this.shapelayer = view.shapelayer;
        this.active = false;
        this.prevPoint = null;
    }
    _getScaleFactor() {
        return getScaleFactor(this.view);
    }
    //取消绘制
    cancel() {}
    // 完成绘制
    done() {}
    // 撤销一步
    back() {
        if (!this.poly) {
            this?.view?.editor.showMsg('error', 'No record yet');
        }
    }
    // 回复一步
    forward() {
        if (!this.poly || this?.backPoint?.length == 0 || !this?.backPoint) {
            this?.view?.editor.showMsg('error', 'No record yet');
        }
    }
    toJSON() {}
    event(evtName, e, point) {
        let handler = evtName + 'Handler';
        if (this[handler]) {
            this[handler].call(this, e, point);
        }
    }
    toggleUI() {
        if (this.ui) {
            this.ui.toggle();
        }
    }
    setActive(active) {
        this.active = active;
        this.toggleUI();
    }
    destroy() {
        this.view = null;
        this.config = null;
    }
    static getName() {
        return this.name.replace('Tool', '').toLowerCase();
    }
}
