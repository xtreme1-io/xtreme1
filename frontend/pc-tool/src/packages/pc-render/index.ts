// import Action from './action/Action';
import OrbitControlsAction from './action/OrbitControlsAction';
import TransformControlsAction from './action/TransformControlsAction';
import Render2DTrackAction from './action/Render2DTrackAction';
import SelectAction from './action/SelectAction';
import ResizeTransAction from './action/ResizeTransAction';
import CreateAction from './action/CreateAction';
import LabelAction from './action/LabelAction';
import Render2DAction from './action/Render2DAction';
import Edit2DAction from './action/Edit2DAction';
import Transform2DAction from './action/Transform2DAction';
import ViewHelperAction from './action/ViewHelperAction';

import { registryAction } from './action/index';

[
    OrbitControlsAction,
    TransformControlsAction,
    Render2DTrackAction,
    SelectAction,
    ResizeTransAction,
    CreateAction,
    LabelAction,
    Render2DAction,
    Edit2DAction,
    Transform2DAction,
    ViewHelperAction,
].forEach((action) => {
    registryAction(action.actionName, action as any);
});

export { Event } from './config/index';

export * from './points';
export { default as PointCloud } from './PointCloud';
export { default as RenderView } from './renderView/Render';
export { default as MainRenderView } from './renderView/MainRenderView';
export { default as SideRenderView } from './renderView/SideRenderView';
export { default as Image2DRenderView } from './renderView/Image2DRenderView';
export { default as Image2DRenderProxy } from './renderView/Image2DRenderProxy';

export { default as PointsMaterial } from './material/PointsMaterial';
export { default as PCDLoader } from './loader/PCDLoader';
export * as utils from '../pc-render/utils';
export {
    OrbitControlsAction,
    TransformControlsAction,
    Render2DTrackAction,
    SelectAction,
    ResizeTransAction,
    CreateAction,
    LabelAction,
    Render2DAction,
    Edit2DAction,
    Transform2DAction,
    ViewHelperAction,
};

export * from './objects';

// type
export type { axisType } from './renderView/SideRenderView';
export type { viewType } from './common/ViewHelper';
export type { wayToFocus } from './renderView/MainRenderView';
export type { IColorRangeItem, IUniformOption } from './material/PointsMaterial';
export * from './type';
