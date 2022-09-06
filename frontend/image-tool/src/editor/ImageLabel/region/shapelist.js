function getItemById(uuid, list) {
    let ret = undefined;
    for (let i = 0; i < list.length; i++) {
        if (list[i].uuid === uuid) {
            ret = list[i];
        } else if (list[i].children) {
            ret = getItemById(uuid, list[i].children);
        }
        if (ret) {
            break;
        }
    }
    return ret;
}

export function flatList(list) {
    let ret = [];
    let group = [];
    list.forEach((item) => {
        if (item.children) {
            group.push(item);
            ret.push.apply(ret, flatList(item.children).list);
        } else {
            ret.push(item);
        }
    });
    return {
        list: ret,
        group,
    };
}
export default class ShapeList {
    constructor(view) {
        this.view = view;
        this._list = new Set();
        this.length = 0;
    }
    getItemById(id) {
        return getItemById(id, [...this._list]);
    }
    add(shape) {
        if (!this._list.has(shape)) {
            this.length += 1;
        }
        this._list.add(shape);
    }
    remove(shape) {
        if (this._list.has(shape)) {
            this._list.delete(shape);
            this.length -= 1;
        }
    }
    get size() {
        return this._list.size;
    }
    toArray() {
        return [...this._list].sort((a, b) => {
            // return b._index - a._index;
            return a._index - b._index;
        });
    }
    getFlatListAndGroupInfo() {
        return flatList(this.toArray());
    }
    forEach(cb) {
        this._list.forEach(cb);
    }
}
