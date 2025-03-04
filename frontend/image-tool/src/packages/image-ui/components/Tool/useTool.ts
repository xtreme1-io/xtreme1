import { ref, watchEffect } from 'vue';
import { useInjectEditor } from '../../context';
import { toolMap, IItemConfig, tools } from './item';
import { Event, ModelTypeEnum, ToolName } from '../../../image-editor';
import { t } from '@/lang';
interface IToolConfig {
  toolItems: IItemConfig[];
  fixedItems: IItemConfig[];
  modelItems: IItemConfig[];
  polygonItems: IItemConfig[];
}

export default function useTool() {
  const editor = useInjectEditor();
  editor.on(Event.TOOL_CHANGE, onToolByHotkey);
  editor.on(Event.UPDATE_VIEW_MODE, updateItemList);
  editor.on(Event.CLASS_INITDATA, updateItemList);
  editor.on(Event.MODEL_LOADED, updateItemList);

  // 工具显示状态以及快捷键管理
  const hotKeyMap = new Map<string, ToolName>();
  const toolState = ref<IToolConfig>({
    toolItems: [],
    fixedItems: [],
    modelItems: [],
    polygonItems: [],
  });

  // watch(
  //   () => editor.state.imageToolMode,
  //   () => {
  //     updateItemList();
  //   },
  // );

  function updateItemList() {
    const { fixed, tools, model } = getCurModeTools();
    hotKeyMap.clear();
    const config: IToolConfig = {
      toolItems: [],
      fixedItems: [],
      modelItems: [],
      polygonItems: [],
    };
    config.toolItems = filterTools(tools);
    config.fixedItems = filterTools(fixed);
    config.modelItems = filterTools(model);
    config.polygonItems = [] as IItemConfig[];
    const list = [...config.fixedItems, ...config.modelItems, ...config.polygonItems];
    updateFixedHotkey(list);
    updateCustomHotkey(config.toolItems);
    toolState.value = config;
  }
  watchEffect(updateItemList);
  function getCurModeTools() {
    return (tools as any)[editor.state.imageToolMode];
  }
  /** filter tool*/
  function filterTools(list: IItemConfig[]) {
    return list.filter((item) => item.isDisplay(editor));
  }
  // 固定的快捷键
  function updateFixedHotkey(list: IItemConfig[]) {
    list.forEach((item) => {
      const key = String(item.hotkey).toLocaleLowerCase();
      key && hotKeyMap.set(key, item.action);
    });
  }
  // 自定义顺序的tool的快捷键
  function updateCustomHotkey(list: IItemConfig[]) {
    list.forEach((item, index) => {
      const hotkey = ((index + 1) % 10) + '';
      item.order = index;
      item.hotkey = hotkey;
      hotKeyMap.set(hotkey, item.action);
    });
  }

  function onToolByHotkey(key: string) {
    key = key.toLocaleLowerCase();
    const actionName = hotKeyMap.get(key);
    if (!actionName || !toolMap[actionName]) return;
    onTool(actionName);
  }

  /** Select Tool */
  function onTool(name: string, args?: any) {
    // let config = editor.state.config;
    console.log('select', name, args);
    switch (name) {
      case 'edit': {
        editor.actionManager.execute('selectTool');
        break;
      }
      case 'rect':
      case 'polygon':
      case 'line':
      case 'key-point':
      case 'spline-curve':
      case 'skeleton':
      case 'cuboid':
      case 'comment':
      case 'interactive':
      case 'shape-circle':
      case 'brush':
      case 'ellipse':
      case 'mask-polygon':
      case 'mask-fill': {
        editor.actionManager.execute('drawTool', name);
        break;
      }
      case 'addInterior': {
        editor.actionManager.execute('holeSelection', name);
        break;
      }
      case 'removeInterior': {
        editor.actionManager.execute('removeHoleSelection');
        break;
      }
      case 'clipPolygon': {
        editor.actionManager.execute('clipSelection', args);
        break;
      }
      case 'mergePolyline': {
        editor.actionManager.execute('mergePolyline', args);
        break;
      }
      case 'group': {
        editor.actionManager.execute('createGroup');
        break;
      }
      case 'panoramic':
      case 'model': {
        if (editor.mainView.currentDrawTool?.doing()) {
          return editor.showMsg('warning', t('image.resultNotComplete'));
        }
        editor.handleModel(
          name === 'model' ? ModelTypeEnum.OBJECT_DETECTION : ModelTypeEnum.SEMANTIC_SEGMENTATION,
        );
        break;
      }
      case 'intellect': {
        editor.actionManager.execute('drawTool', name);
        break;
      }
      case 'segment': {
        const tool = editor.state.toolConfig.segmentTool;
        tool && onTool(tool);
        break;
      }
      case 'show-points': {
        editor.actionManager.execute('showPoints', name);
      }
    }
  }

  return {
    toolState,
    onTool,
    updateItemList,
    updateCustomHotkey,
    // onClaim,
  };
}
