import Shape from './Shape';
import Circle from './Circle';
import Anchor from './Anchor';
import KeyPoint from './Keypoint';
import Rect from './Rect';
import Line from './Line';
import Polygon from './Polygon';

export { Shape, Circle, Anchor, KeyPoint, Rect, Line, Polygon };
export type AnnotateObject = Shape;
export type AnnotateClassName = 'rect' | 'polyline' | 'polygon' | 'key-point';
