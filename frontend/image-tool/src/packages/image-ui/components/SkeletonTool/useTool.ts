import { useInjectEditor } from '../../context';
import { reactive } from 'vue';
import { Event, IClassTypeItem, ToolType } from '../../../image-editor';
import SkeletonTool, {
  SkeletonEvent,
  Type,
} from '../../../image-editor/ImageView/shapeTool/SkeletonTool';
import { IEquidistant, IPoint, ITag, ToolType as EqualToolType } from './type';
import { throttle, debounce } from 'lodash';
import SkeletonToolCmd from '../../../image-editor/common/CmdManager/skeletonTool/SkeletonToolCmd';

let tagMap = {} as Record<string, ITag>;

// 只是用来做打印的，所以没有全局声明
declare global {
  interface Window {
    tool: SkeletonTool;
    iState: any;
  }
}

export default function useSkeletonTool() {
  const editor = useInjectEditor();
  let tool = {} as SkeletonTool;
  let skeGraph: any;
  // state
  const iState = reactive({
    classList: undefined as any as IClassTypeItem[],
    curClass: undefined as any as IClassTypeItem,
    currentIndex: -1,
    nextIndex: -1,
    visible: false,
    points: [] as IPoint[],
    tags: [] as ITag[],
    orderList: [] as IEquidistant[],
    customList: [] as IEquidistant[],
    showEquidistant: false,
    // infos: [] as ISkeletonInfo[],
    equalTool: {
      order: 'curve' as EqualToolType,
      custom: 'curve' as EqualToolType,
    },
  });

  editor.on(Event.INIT, () => {
    init();
  });

  const update = throttle(updateData, 16);
  function onDraw() {
    update();
  }

  function init() {
    tool = new SkeletonTool(editor.mainView);
    editor.mainView.setShapeTool('skeleton', tool);
    window.tool = tool;
    window.iState = iState;
    SkeletonToolCmd.getInstance().init(editor, tool);

    // tool.on('object' as ToolEvent, onObject);
    tool.on('init' as SkeletonEvent, onStart);
    tool.on('clear' as SkeletonEvent, onEnd);
    tool.on('change' as SkeletonEvent, update);
    tool.on('hotKey' as SkeletonEvent, onTagHotkey);

    // editor.mainView.enableDraw('skeleton');
    editor.on(Event.SKELETON_GRAPH, onUpdateGraph);
  }

  function initData() {
    editor.off(Event.DRAW, onDraw);
    editor.on(Event.DRAW, onDraw);
  }

  function initSkeleton(ske: any) {
    skeGraph = ske;
    skeGraph.on('click', onGraphClick);
    updateSkeleton();
  }
  async function updateSkeleton() {
    if (!skeGraph || !iState.curClass) return;
    const skeConfig = iState.curClass.getToolOptions().skeletonConfig;
    if (!skeConfig) return;
    initConfigData();
    await skeGraph.setData(skeConfig);
    onUpdateGraph();
  }
  const onUpdateGraph = debounce(() => {
    const { showGraphLabel, graphRadius } = editor.state.config.skeletonConfig;
    if (!iState.visible || !skeGraph) return;
    skeGraph.visibleLabel(showGraphLabel);
    tool.object.points.forEach((e, index) => {
      const color = e.attrs.valid ? e.attrs.fill : '#878f98';
      skeGraph.updateAnchorStyle(index, { color, radius: graphRadius });
    });
    skeGraph.selectCircleByIndex(iState.currentIndex);
  }, 100);
  const onGraphClick = debounce((e: any) => {
    if (e.target?.attrs?.alias === skeGraph.asCircle) {
      const index = e.target.index;
      onPointClick(iState.points[index], index);
    }
  }, 100);

  function initConfigData() {
    // console.log(iState.curClass);
    const config = iState.curClass.getToolOptions();
    // points && tags && equidistants
    const { pointList, tagList, equidistantList } = config.skeletonConfig;
    iState.points = pointList.map((e: any, index: number) => {
      return {
        name: index + 1 + '',
        tag: '',
        label: e.label || '',
        valid: false,
        color: '#ccc',
        pointColor: e.color || iState.curClass?.color || '#57ccef',
      } as IPoint;
    });
    iState.tags = tagList;
    // tag map
    tagMap = {};
    tagList.forEach((e: ITag, index: number) => {
      // if (e.hotkey.length > 1) e.hotkey = e.hotkey.slice(0, 1);
      e.index = index;
      if (index === 0) e.color = iState.curClass?.color || '';
      // if (!e.color) e.color = '#57ccef';
      tagMap[e.attribute] = e;
    });

    const { customList, orderList } = equidistantList;
    iState.orderList = orderList
      ? orderList.map((e: IEquidistant) => {
          return {
            ...e,
            label: `${e.fromValue}~${e.toValue}`,
          };
        })
      : [];
    iState.customList = customList
      ? customList.map((e: IEquidistant) => {
          return {
            ...e,
            label: e.value,
          };
        })
      : [];
    iState.showEquidistant = iState.orderList.length > 0 || iState.customList.length > 0;
    tool.initClassConfig(iState.curClass);
  }

  // let transform = new Konva.Transform();
  function updateData() {
    if (!tool.object || !iState.visible) return;
    const object = tool.object;
    object.selectChild = object.points[tool.currentIndex];

    iState.currentIndex = tool.currentIndex;
    iState.nextIndex = tool.nextIndex;

    object.points.forEach((e, index) => {
      e.userData.activeIndex = iState.currentIndex;
      const { tag } = e.userData;

      let tagConfig = tagMap[tag || ''];
      if (tag && !tagConfig) tagConfig = tagMap['Common'];
      const point = iState.points[index];
      if (!point) return;
      point.valid = e.attrs.valid;
      point.tag = tagConfig?.attribute || '';
      if (tagConfig.index === 0) {
        point.color = point.pointColor || iState.curClass.color || '#aaa';
      } else {
        point.color = tagConfig?.color || '#aaa';
      }
    });
    onUpdateGraph();
    updatePointExtra();
  }
  function updatePointExtra() {
    iState.points.forEach((p, index) => {
      p.extra = editor.checkSkePoints(tool.object.uuid, index);
    });
  }

  function onStart(edit?: boolean) {
    console.log('onStart', edit);
    if (!iState.classList) {
      iState.classList = editor.getClassList(ToolType.SKELETON);
      if (iState.classList.length === 0) {
        console.error('no invalid classList');
        return;
      }
    }

    if (tool.mode === Type.Draw) {
      const defaultClass = editor.getClassType(editor.state.currentClass);
      if (defaultClass?.toolType === ToolType.SKELETON) {
        iState.curClass = defaultClass;
      } else {
        iState.curClass = iState.classList[0];
        editor.state.currentClass = iState.curClass.id;
      }
    } else {
      iState.curClass = editor.getClassType(tool.object.userData.classId);
      editor.state.currentClass = iState.curClass.id;
    }

    if (!iState.curClass) {
      console.error('no invalid classList');
      return;
    }

    // if (tool.object?.userData.classId)
    //     iState.curClass = editor.getClassType(tool.object?.userData.classId);
    // else iState.curClass = iState.classList[0];

    initData();
    updateSkeleton();
    updateData();
    iState.visible = true;
    SkeletonToolCmd.getInstance().clear();
    // if (editor.state.status != StatusType.Create) editor.state.status = StatusType.Create;
  }

  function onEnd() {
    console.log('onEnd');
    editor.off(Event.DRAW, onDraw);
    iState.visible = false;
  }

  function onCreateCurve() {
    // tool.createObject();
  }
  function onTagHotkey(key: number) {
    const index = (key + 9) % 10;
    const tag = iState.tags[index];
    if (tag && iState.currentIndex >= 0) onTagClick(tag);
  }
  function onTagClick(tag: ITag) {
    if (!tool.object || !editor.editable) return;

    const anchor = tool.object.points[iState.currentIndex];
    if (!anchor) return;
    tool.emit('change-before', { type: 'anchor', anchors: [anchor.index] });
    const fill = tag.index == 0 ? iState.points[iState.currentIndex].pointColor : tag.color;
    anchor.userData.tagId = tag.id;
    anchor.userData.tag = tag.attribute;
    anchor.userData.tagColor = fill;
    anchor.setAttrs({ fill });
    if (tool.object.frame) {
      tool.object.frame.needSave = true;
    }
    updateData();
  }
  function onPointClick(point: IPoint, index: number) {
    if (!point) return;
    if (point.valid) {
      tool.currentIndex = index;
      iState.currentIndex = index;
    } else {
      tool.nextIndex = index;
      iState.nextIndex = index;
    }
    updateData();
    editor.mainView.updateStateStyle(tool.object);
    editor.mainView.draw();
  }

  function onEqual(rule: IEquidistant, type: 'order' | 'custom') {
    if (!editor.editable) return;
    let pointsIndex = [] as number[];
    if (type === 'custom') {
      pointsIndex = rule.value?.split(',').map((e) => Number(e) - 1) || [0];
    } else {
      let fromVal = Math.round(rule.fromValue || 1);
      const toVal = Math.round(rule.toValue || 1);
      const diff = (toVal - fromVal) / (Math.abs(toVal - fromVal) || 1);
      while (fromVal != toVal) {
        pointsIndex.push(fromVal - 1);
        fromVal += diff;
      }
      pointsIndex.push(toVal - 1);
    }
    const tension = iState.equalTool[type] === 'curve' ? 0.5 : 0;
    tool.createDivideObject(pointsIndex, tension);
  }

  return {
    iState,
    onCreateCurve,
    onTagClick,
    onPointClick,
    onEqual,
    initConfigData,
    initSkeleton,
    updateSkeleton,
  };
}
