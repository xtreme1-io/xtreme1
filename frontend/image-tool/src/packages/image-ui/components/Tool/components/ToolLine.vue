<template>
  <a-tooltip
    overlayClassName="inner-pd0-tooltip"
    trigger="click"
    placement="right"
    :visible="state.visible"
  >
    <span class="tip-target"> </span>
    <template #title>
      <div class="tool-btn-tooltip">
        <template v-for="option in options" :key="option.hotKey">
          <a-tooltip placement="right" destroyTooltipOnHide>
            <template #title> <TipNode :text="option.tipText" :hotkey="option.hotKey" /></template>
            <div @click="option.onClick" class="tool-btn">
              <div><component :is="option.icon" /></div>
              <div class="text">{{ option.action }}</div>
            </div>
          </a-tooltip>
        </template>
      </div>
    </template>
  </a-tooltip>
</template>
<script lang="ts" setup>
  import { useInjectEditor } from '../../../context';
  import { reactive, computed, h } from 'vue';
  import { IconSplitPolyline, IconShortcutKey, IconPolylineSplit } from '@basicai/icons';
  import { t } from '@/lang';
  import { vueMsg } from 'image-ui/utils';
  import { Event, Line, LineTool } from 'image-editor';
  import { isMac } from '../../../../image-editor/lib/ua';
  // ***************Props and Emits***************

  // ***************Props and Emits***************
  enum IMode {
    Split = 'split',
    Merge = 'merge',
  }
  const editor = useInjectEditor();
  const state = reactive<{ visible: boolean; mode: IMode }>({
    visible: false,
    mode: IMode.Split,
  });
  const options = computed(() => {
    const ctrlKey = isMac ? '⌘' : 'Ctrl';
    if (state.mode == IMode.Split) {
      return [
        {
          icon: IconSplitPolyline,
          tipText: t('common.tipSplitPolyline'),
          hotKey: 'Shift+F',
          action: t('common.btnSplit'),
          onClick() {
            const tool = editor.mainView.currentEditTool;
            if (tool instanceof LineTool && tool.object) {
              tool.splitLine();
            }
          },
        },
      ];
    } else {
      return [
        {
          icon: IconPolylineSplit,
          tipText: t('common.tipMerge1'),
          hotKey: 'U',
          action: t('common.btnMerge1'),
          onClick() {
            editor.actionManager.execute('mergePolyline1');
          },
        },
        {
          icon: IconPolylineSplit,
          tipText: t('common.tipMerge2'),
          hotKey: `${ctrlKey}+U`,
          action: t('common.btnMerge2'),
          onClick() {
            editor.actionManager.execute('mergePolyline2');
          },
        },
      ];
    }
  });

  vueMsg(editor, Event.SELECT, () => {
    state.visible = false;
    const selection = editor.selection;
    const polyline = selection.filter((e) => e instanceof Line);
    const showMergeTool = selection.length == 2 && polyline.length == 2;
    if (showMergeTool) {
      state.visible = true;
      state.mode = IMode.Merge;
    }
  });
  vueMsg(editor, Event.ANNOTATE_OBJECT_POINT, () => {
    state.visible = false;
    const tool = editor.mainView.currentEditTool;
    if (tool instanceof LineTool && tool.object) {
      const pointN = tool.object.attrs.points.length;
      if (tool.selectAnchorIndex() > 0 && tool.selectAnchorIndex() < pointN - 1) {
        state.visible = true;
        state.mode = IMode.Split;
      }
    }
  });
  const TipNode = (prop: { text: string; hotkey: string }) => {
    return h('span', {}, [
      prop.text,
      h(IconShortcutKey, { style: 'margin: 0 4px 0 6px' }),
      prop.hotkey,
    ]);
  };
</script>
