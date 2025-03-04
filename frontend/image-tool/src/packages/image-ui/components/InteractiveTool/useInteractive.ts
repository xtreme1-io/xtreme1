import { useInjectEditor } from '../../context';
import { reactive } from 'vue';
import { Event, utils, Circle, Polygon } from '../../../image-editor';
import InteractiveTool from './InteractiveTool';
import Konva from 'konva';
import { Canceler } from 'axios';

export default function useInteractive() {
  const editor = useInjectEditor();
  const { state } = editor;
  let tool = {} as InteractiveTool;
  const iState = reactive({
    enable: false,
    //
    loading: false,
    loadingX: 0,
    loadingY: 0,
    // btn
    showBtn: false,
    btnX: 0,
    btnY: 0,
  });

  const cancelMsg = '___cancel_msg___';
  let canceler = undefined as Canceler | undefined;

  editor.on(Event.INIT, () => {
    init();
  });

  function init() {
    tool = new InteractiveTool(editor.mainView);
    editor.mainView.setShapeTool('interactive', tool);

    editor.on(Event.INTERACTIVE_RETRY, doIdentify);

    tool.on('dragEnd', onDragEnd);
    tool.on('draw', onDraw);
    tool.on('stopDraw', onStopDraw);
    tool.on('addPoints', onAddPoints);

    editor.mainView.stage.on('scaleXChange scaleYChange xChange yChange', updatePosition);
    tool.rect.on('widthChange heightChange xChange yChange', updatePosition);
  }

  function onDraw() {
    clear();
    iState.enable = true;
  }
  function onStopDraw() {
    clear();
  }

  function clear() {
    iState.enable = false;
    iState.showBtn = false;
    iState.loading = false;
    if (tool) tool.updateMask(false);
    if (canceler) {
      canceler(cancelMsg);
      canceler = undefined;
    }
  }

  async function onDragEnd() {
    updatePosition();
    const isCancel = await doIdentify(true);
    if (isCancel) return;

    iState.showBtn = true;
    tool.edit();
  }

  function onAddPoints() {
    doIdentify();
  }

  let updatePosFlag = false;
  function updatePosition() {
    if (updatePosFlag || !iState.enable) return;

    updatePosFlag = true;
    Konva.Util.requestAnimFrame(() => {
      updatePosFlag = false;

      const pos = tool.rect.getClientRect();
      iState.btnX = pos.x;
      iState.btnY = pos.y;

      iState.loadingX = pos.x + pos.width / 2;
      iState.loadingY = pos.y + pos.height / 2;
    });
  }

  async function doIdentify(first?: boolean) {
    const frame = editor.getCurrentFrame();
    const { x, y, width, height } = tool.rect.attrs;
    const keyPoints = (tool.keyPoints.children || []) as Circle[];

    const seqs = keyPoints.map((e) => {
      return { ...e.position(), type: e.attrs.pointType };
    });
    const identifyData = {
      clickSeq: first ? [] : seqs,
      crop: [
        { x: x, y: y },
        { x: x + width, y: y + height },
      ],
      imgUrl: frame.imageData?.url || '',
    };
    const config = {
      datas: [identifyData],
      params: { distThres: state.config.smoothness.toString() },
    };

    iState.loading = true;
    tool.enable = false;
    tool.updateMask(iState.loading);
    const tm = Date.now();
    let isCancel = false;
    try {
      const result = await editor.runIdentify(config, (cancel: Canceler) => {
        canceler = cancel;
      });
      // clear
      canceler = undefined;
      updateData(result.data, first);
    } catch (error: any) {
      console.log(error);
      if (error.message === cancelMsg) {
        isCancel = true;
      } else {
        editor.handleErr(error, 'Interactive Tool Error');
      }
    }
    iState.loading = false;
    tool.enable = true;
    tool.updateMask(iState.loading);
    console.log('交互式工具时间:', Date.now() - tm);
    return isCancel;
  }

  function updateData(data: any, first?: boolean) {
    const { contour, hierarchy, clickSeq } = data;
    if (hierarchy && contour) {
      if (first && clickSeq) {
        tool.addKeyPoints(clickSeq.type, { x: clickSeq.x, y: clickSeq.y });
      }
      const polygons = getPolygonData(contour, hierarchy);
      console.log(polygons);
      tool.updatePolygonData(polygons);
    } else {
      editor.showMsg('warning', 'No Data');
    }
  }

  return {
    iState,
    doIdentify,
    editor,
  };
}

function getPolygonData(contour: number[][][], hierarchy: number[][]) {
  const polygonMap = {} as Record<string, Polygon>;
  const polygons = [] as Polygon[];
  contour.forEach((obj, index) => {
    const typeIndex = hierarchy[index][3];

    let points = obj.map((e) => {
      return { x: e[0], y: e[1] };
    });

    // console.log('old', points.length);
    // 合并位置很近的点
    points = utils.mergeSamePoints(points);
    // console.log('new', points.length);

    // -1 表示外圈的点, 否则代表父级的index
    if (typeIndex === -1) {
      const polygon = new Polygon({ points, innerPoints: [] });
      polygonMap[index] = polygon;
      polygons.push(polygon);
    } else {
      const parent = polygonMap[typeIndex];
      if (parent) {
        parent.attrs.innerPoints.push({ points });
      }
    }
  });

  return polygons;
}
