import { AnnotateObject, utils } from '../../../image-editor';
import { useInjectEditor } from '../../context';

export interface IDirection {
  id: string;
  x: number;
  y: number;
  r: number;
}
export default function useDirection() {
  const editor = useInjectEditor();
  const { config } = editor.state;
  /**
   * polygon/polyline direction
   */
  function getDirections(objs: AnnotateObject[]) {
    const list: IDirection[] = [];
    if (config.showObjectDriect === 0) return list;
    const scale = editor.mainView.stage.scaleX();
    const showAll = config.showObjectDriect > 1;
    objs.forEach((poly) => {
      const isShow = showAll || poly.state.select || poly.state.hover;
      if (!isShow) return;
      const points = utils.getShapeRealPoint(poly);
      const [p1, p2] = points;
      if (!p1 || !p2) return;
      list.push({
        id: poly.uuid,
        x: ((p1.x + p2.x) / 2) * scale,
        y: ((p1.y + p2.y) / 2) * scale,
        r: utils.computeDegree(p1, p2),
      });
    });
    return list;
  }

  return {
    getDirections,
  };
}
