import { h } from 'vue';
import type { Component } from 'vue';
import { ToolType, ToolName } from './enum';
import {
  IconTooltypeBoundingBox,
  IconTooltypePolygon,
  IconTooltypePolyline,
  IconTooltypeKeyPoint,
  IconTooltypeCurve,
  IconTooltypeCuboid,
  IconTooltypeSkeleton,
  IconTooltypeMask,
  IconTooltypeCircle,
  IconTooltypeEllipse,
  IconToolEdit,
  IconToolSegmentation,
  IconToolPolygon,
  IconToolFillIn,
  IconShowPoints,
  IconWithComments,
  IconToolInteractive,
  IconToolPanoramic,
  IconToolIntellect,
  IconLoading,
  IconTooltypeGroup,
  IconCommentReply,
  IconShowKeypoints,
  IconConnectingLine,
  IconArrow,
} from '@basicai/icons';

export type AllTool = ToolType | ToolName | 'loading' | '';
export const ToolIconClass: Record<AllTool, Component | string> = {
  [ToolType.BOUNDING_BOX]: IconTooltypeBoundingBox,
  [ToolType.RECTANGLE]: IconTooltypeBoundingBox,
  [ToolName.rect]: IconTooltypeBoundingBox,
  [ToolName['show-points']]: IconShowKeypoints,

  [ToolType.POLYGON]: IconToolPolygon,
  [ToolType.POLYGON_PLUS]: IconToolPolygon,
  [ToolName.polygon]: IconToolPolygon,

  [ToolType.MASK]: IconTooltypeMask,
  [ToolName.segment]: '',

  [ToolName['shape-circle']]: IconTooltypeCircle,
  [ToolType.CIRCLE]: IconTooltypeCircle,
  [ToolName.ellipse]: IconTooltypeEllipse,
  [ToolType.ELLIPSE]: IconTooltypeEllipse,

  [ToolType.POLYLINE]: IconConnectingLine,
  [ToolName.line]: IconConnectingLine,

  [ToolType.KEY_POINT]: IconTooltypeKeyPoint,
  [ToolName['key-point']]: IconTooltypeKeyPoint,

  [ToolType.GROUP]: IconTooltypeGroup,

  [ToolType.SKELETON]: IconTooltypeSkeleton,
  skeleton: IconTooltypeSkeleton,

  [ToolType.CURVE]: IconTooltypeCurve,
  [ToolName['spline-curve']]: IconTooltypeCurve,

  [ToolType.IMAGE_CUBOID]: IconTooltypeCuboid,
  [ToolName.cuboid]: IconTooltypeCuboid,

  [ToolName.edit]: IconArrow,
  [ToolName.model]: IconToolPanoramic,
  [ToolName.interactive]: IconToolInteractive,
  [ToolName.comment]: IconCommentReply,
  [ToolName.default]: '',
  [ToolName.brush]: IconToolSegmentation,
  [ToolName.group]: '',
  [ToolName['mask-polygon']]: '',
  [ToolName['mask-fill']]: IconToolFillIn,
  [ToolName.panoramic]: IconToolPanoramic,
  [ToolName.intellect]: IconToolIntellect,
  loading: IconLoading,
};

export const ToolIconNode: Record<AllTool, any> = {
  [ToolType.BOUNDING_BOX]: IconTooltypeBoundingBox,
  [ToolType.RECTANGLE]: IconTooltypeBoundingBox,
  [ToolType.POLYGON]: IconTooltypePolygon,
  [ToolType.POLYGON_PLUS]: IconTooltypePolygon,
  [ToolType.POLYLINE]: IconTooltypePolyline,
  [ToolType.KEY_POINT]: IconTooltypeKeyPoint,
  [ToolType.CURVE]: IconTooltypeCurve,
  [ToolType.IMAGE_CUBOID]: IconTooltypeCuboid,
  [ToolType.GROUP]: IconTooltypeGroup,
  [ToolType.SKELETON]: IconTooltypeSkeleton,
  [ToolType.MASK]: IconTooltypeMask,
  [ToolType.CIRCLE]: IconTooltypeCircle,
  [ToolType.ELLIPSE]: IconTooltypeEllipse,
  [ToolName.default]: undefined,
  [ToolName.edit]: IconToolEdit,
  [ToolName.comment]: IconWithComments,
  [ToolName['show-points']]: IconShowPoints,
  [ToolName.rect]: IconTooltypeBoundingBox,
  [ToolName.polygon]: IconTooltypePolygon,
  [ToolName.line]: IconTooltypePolyline,
  [ToolName.ellipse]: IconTooltypeEllipse,
  [ToolName['shape-circle']]: IconTooltypeCircle,
  [ToolName['spline-curve']]: IconTooltypeCurve,
  [ToolName['key-point']]: IconTooltypeKeyPoint,
  [ToolName.skeleton]: IconTooltypeSkeleton,
  [ToolName.cuboid]: IconTooltypeCuboid,
  [ToolName.segment]: undefined,
  [ToolName.brush]: IconToolSegmentation,
  [ToolName['mask-polygon']]: IconToolPolygon,
  [ToolName['mask-fill']]: IconToolFillIn,
  [ToolName.interactive]: IconToolInteractive,
  [ToolName.model]: IconToolPanoramic,
  [ToolName.intellect]: IconToolIntellect,
  [ToolName.panoramic]: IconToolPanoramic,
  [ToolName.group]: IconTooltypeGroup,
  loading: IconLoading,
};

interface IToolIcon {
  tool: AllTool;
}
export const ToolIcon = (props: IToolIcon, ctx: any) => {
  const { tool } = props;
  const iconNode = ToolIconNode[tool];
  let iconClass: string[] | undefined = [];
  if (iconNode) {
    iconClass = tool === 'loading' ? ['loading'] : undefined;
  } else {
    iconClass = [props.tool];
  }
  // 返回VNode
  return h(iconNode, { style: 'font-size: 16px', class: iconClass });
};
