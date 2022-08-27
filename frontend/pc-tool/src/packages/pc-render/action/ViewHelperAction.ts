import MainRenderView from '../renderView/MainRenderView';
import Action from './Action';
import * as THREE from 'three';
import { ViewHelper, UIElement, viewType } from '../common/ViewHelper';
import OrbitControlsAction from './OrbitControlsAction';
import { Event } from '../config';

export default class ViewHelperAction extends Action {
    static actionName: string = 'view-helper';
    private listener: () => void;
    renderView: MainRenderView;
    viewHelper: ViewHelper;
    constructor(renderView: MainRenderView) {
        super();
        this.enabled = true;
        this.renderView = renderView;
        const controls = (renderView.actionMap['orbit-control'] as OrbitControlsAction).control;
        let viewHelper = new ViewHelper(renderView, controls);

        const dom = document.createElement('div');
        dom.style.cssText = 'position:absolute;right:0px;bottom:0px;height:128px;width:128px;';
        const panel = new UIElement(dom);
        panel.setId('viewHelper');
        panel.dom.addEventListener('pointerup', (event: MouseEvent) => {
            event.stopPropagation();
            viewHelper.handleClick(event);
        });

        panel.dom.addEventListener('pointerdown', function (event: MouseEvent) {
            event.stopPropagation();
        });
        renderView.container.appendChild(panel.dom);
        this.listener = () => {
            viewHelper.render(renderView.renderer);
        };
        this.viewHelper = viewHelper;
    }
    view(type: viewType): Promise<boolean> {
        return this.viewHelper.view(type);
    }
    destroy(): void {
        this.renderView.removeEventListener(Event.RENDER_AFTER, this.listener);
    }
    init() {
        let renderView = this.renderView;
        renderView.addEventListener(Event.RENDER_AFTER, this.listener);
    }
}
