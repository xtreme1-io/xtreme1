import Tools from './tool_index.js';
import { MODETYPE, fixedPointPositionIfNeed } from '../util';
import { config } from '../config';
export class ToolManager {
    constructor(view) {
        this.view = view;
        this.tools = {};
        this.currentTool = null;
        for (const key in Tools) {
            if (Tools.hasOwnProperty(key)) {
                const Tool = new Tools[key](this.view);
                this.addTool(Tool);
            }
        }
    }
    getCurrentToolName() {
        return this.currentTool ? this.currentTool.name : '';
    }
    addTool(tool) {
        this.tools[tool.name] = tool;
        if (tool.default) {
            this.currentTool = tool;
        }
    }
    selectTool(name) {
        if (name in this.tools) {
            this.currentTool && this.currentTool.setActive(false);
            this.currentTool = this.tools[name];
            this.currentTool.setActive(true);
        }
    }
    cancel() {
        this.view.setDrawingState(false);
        if (this.currentTool) {
            this.currentTool.cancel();
        }
    }
    done() {
        // this.view.setDrawingState(false);
        if (this.currentTool) {
            this.currentTool.done();
        }
    }
    back() {
        if (this.currentTool) {
            this.currentTool.back();
        }
    }
    forward() {
        if (this.currentTool) {
            this.currentTool.forward();
        }
    }
    setLabel(labelInfo) {
        if (this.currentTool) {
            this.currentTool.setLabel(labelInfo);
        }
    }
    appendLabel(labelInfo) {
        if (this.currentTool) {
            this.currentTool.appendLabel(labelInfo);
        }
    }
    removeLabel(index) {
        if (this.currentTool) {
            this.currentTool.removeLabel(index);
        }
    }
    setText(text) {
        if (this.currentTool) {
            this.currentTool.setText(text);
        }
    }
    setLabelAttrs(attrs) {
        if (this.currentTool) {
            this.currentTool.setLabelAttrs(attrs);
        }
    }
    setPose(pose) {
        if (this.currentTool) {
            this.currentTool.setPose(pose);
        }
    }
    event(evtName, e, point) {
        if (this.currentTool && this.view.mode !== MODETYPE.VIEW) {
            point && fixedPointPositionIfNeed(point, this.view.limitBbox, config.limitInBackgroud);
            // let aitoolName = this.view.currentAitool;
            let currentTool = this.currentTool;
            // if (this.view.aiAssitance.enable && aitoolName && this.tools[aitoolName]) {
            //     currentTool = this.tools[aitoolName];
            // }
            currentTool.event(evtName, e, point);
        }
    }
    destroy() {
        for (const key in this.tools) {
            if (this.tools.hasOwnProperty(key)) {
                this.tools[key].destroy();
            }
        }
        this.view = null;
        this.tools = null;
        this.currentTool = null;
    }
}
