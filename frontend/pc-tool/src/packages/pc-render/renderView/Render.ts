import * as THREE from 'three';
import Action from '../action/Action';
import Actions, { ActionCtr } from '../action';
import { Event } from '../config';

// type ActionCtr = new () => Action;

export default class Render extends THREE.EventDispatcher {
    id: string;
    renderId: string = '';
    actions: string[] = [];
    name: string = '';
    enabled: boolean = true;
    actionMap: { [key: string]: Action } = {};

    private renderTimer: number = 0;

    constructor(name?: string) {
        super();

        if (name) this.name = name;
        this.id = THREE.MathUtils.generateUUID();
    }

    init() {}

    destroy() {}

    /**
     * @param enabled
     */
    toggle(enabled: boolean) {
        this.enabled = enabled;

        if (enabled) this.render();
    }

    isEnable(): boolean {
        return this.enabled;
    }

    getAction(name: string) {
        return this.actionMap[name];
    }
    setActions(actionNames: string[]) {
        this.actions = actionNames;
        actionNames.forEach((name) => {
            let action: Action = new (Actions[name] as ActionCtr)(this);
            action.init();
            this.actionMap[name] = action;
        });
    }
    disableAction(actionName?: string | string[]) {
        let actions: Action[] = [];
        let names = [];
        if (!actionName) {
            names = this.actions;
        } else {
            names = Array.isArray(actionName) ? actionName : [actionName];
            names.forEach((name) => {
                let action = this.actionMap[name];
                if (action) actions.push(action);
            });
        }

        actions.forEach((action) => {
            action.toggle(false);
        });
    }

    enableAction(actionName?: string | string[]) {
        let actions: Action[] = [];
        let names = [];
        if (!actionName) {
            names = this.actions;
        } else {
            names = Array.isArray(actionName) ? actionName : [actionName];
            names.forEach((name) => {
                let action = this.actionMap[name];
                if (action) actions.push(action);
            });
        }

        actions.forEach((action) => {
            action.toggle(true);
        });
    }

    _render() {
        this.dispatchEvent({ type: Event.RENDER_BEFORE });
        this.renderFrame();
        this.renderTimer = 0;
        this.dispatchEvent({ type: Event.RENDER_AFTER });
    }

    renderFrame() {
        throw new Error('must implement method renderFrame;');
    }

    render() {
        if (!this.isEnable()) return;
        if (this.renderTimer) return;
        this.renderTimer = requestAnimationFrame(this._render.bind(this));
    }
}
