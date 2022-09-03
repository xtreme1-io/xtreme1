import uuid from 'uuid/v4';
export default class TagAble {
    constructor(view, opt = {}) {
        this.view = view;
        this.uuid = opt.uuid || uuid();
        // 用户数据
        this.userData = opt.userData;
        this.intId = typeof opt.intId !== 'undefined' ? opt.intId : this._getIntId();
    }
    _getIntId() {
        return this.view.shapeIntId;
    }
    checkValid() {
        this._valid = true;
    }
    formatLabelText(item) {
        return '';
    }
}
