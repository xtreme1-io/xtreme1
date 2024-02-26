import { ref, watchEffect } from 'vue';
import { useInjectEditor } from '../../context';
import {
  Event,
  ToolName,
  toolMap,
  IToolItemConfig,
  tools,
  LoadStatus,
} from '../../../image-editor';
interface IToolConfig {
  toolItems: IToolItemConfig[];
  fixedItems: IToolItemConfig[];
  modelItems: IToolItemConfig[];
  polygonItems: IToolItemConfig[];
}

export default function useTool() {
  const editor = useInjectEditor();
  editor.on(Event.TOOL_CHANGE, onToolByHotkey);
  editor.on(Event.UPDATE_VIEW_MODE, updateItemList);
  editor.on(Event.CLASS_INITDATA, updateItemList);
  editor.on(Event.MODEL_LOADED, updateItemList);

  const hotKeyMap = new Map<string, ToolName>();
  const toolState = ref<IToolConfig>({
    toolItems: [],
    fixedItems: [],
    modelItems: [],
    polygonItems: [],
  });

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
    config.polygonItems = [] as IToolItemConfig[];
    const list = [...config.fixedItems, ...config.modelItems, ...config.polygonItems];
    updateFixedHotkey(list);
    updateCustomHotkey(config.toolItems);
    toolState.value = config;
  }
  watchEffect(updateItemList);
  function getCurModeTools() {
    return (tools as any)[editor.state.annotateMode];
  }
  /** filter tool*/
  function filterTools(list: IToolItemConfig[]) {
    return list.filter((item) => item.isDisplay(editor));
  }
  function updateFixedHotkey(list: IToolItemConfig[]) {
    list.forEach((item) => {
      const key = String(item.hotkey).toLocaleLowerCase();
      key && hotKeyMap.set(key, item.action);
    });
  }
  function updateCustomHotkey(list: IToolItemConfig[]) {
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
    console.log('select', name);
    switch (name) {
      case 'edit': {
        editor.actionManager.execute('selectTool');
        break;
      }
      case 'rect':
      case 'polygon':
      case 'polyline':
      case 'key-point': {
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
      case 'model': {
        const frame = editor.getCurrentFrame();
        // const code = editor.state.modelConfig.code;
        if (frame?.model?.state !== LoadStatus.COMPLETE) return;
        editor.handleModel();
        break;
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
