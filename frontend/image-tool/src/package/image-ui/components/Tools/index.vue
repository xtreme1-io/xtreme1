<template>
  <div class="pc-editor-tool tool-top" :class="editor.state.activeTool">
    <template v-for="item in toolState.fixedItems" :key="item.action">
      <ToolItem :item="item" @onItemClick="onTool" />
    </template>
    <div class="divider" v-show="toolState.toolItems.length > 0"></div>
    <div
      ref="container"
      class="drag-tool-list"
      @dragover="(e) => e.preventDefault()"
      @dragend.stop="handleDragend()"
    >
      <div
        v-for="item in toolState.toolItems"
        :key="item.action"
        draggable="true"
        @dragstart.stop="handleDragstart($event, item)"
        @dragover.stop="onDragOver($event, item)"
      >
        <ToolItem :item="item" @onItemClick="onTool" />
      </div>
      <div
        class="drag-line"
        v-show="state.showDragLine"
        :style="{ left: '0px', top: state.holderY + 'px' }"
      ></div>
    </div>
    <div class="divider" v-show="toolState.modelItems.length > 0"></div>
    <template v-for="item in toolState.modelItems" :key="item.action">
      <ToolItem :item="item" @onItemClick="onTool" />
    </template>
    <div class="item-float-content" v-show="state.showTool && !editor.state.activeTool">
      <span v-show="state.showHollowTool">
        <a-tooltip trigger="hover" placement="right">
          <template #title>Hollow out</template>
          <div class="float-item" @click.stop="onTool('addInterior')">
            <i class="iconfont icon-hollow" style="font-size: 20px"></i>
          </div>
        </a-tooltip>
      </span>
      <span v-show="state.showCancelHollow">
        <a-tooltip trigger="hover" placement="right">
          <template #title>Cancel the hollow out</template>
          <div class="float-item" @click.stop="onTool('removeInterior')">
            <i class="iconfont icon-cancel-hollow" style="font-size: 20px"></i>
          </div>
        </a-tooltip>
      </span>

      <div class="cut-tool-content" v-show="state.showCutTool">
        <a-tooltip trigger="hover" placement="right">
          <template #title>
            <div class="display: flex;align-items: center">
              <span>Do not crop the first objec</span>
              <i
                style="
                  display: inline-block;
                  margin: 0 5px;
                  font-size: 14px;
                  transform: translateY(1px);
                "
                class="iconfont icon-hotkey"
              ></i>
              <span>{{ crop1Keyboard }}</span>
            </div>
          </template>
          <div class="float-item" @click.stop="onTool('clipPolygon', false)">
            <i class="iconfont icon-crop-non-first" style="font-size: 20px"></i>
            <span class="item-title">Crop1</span>
          </div>
        </a-tooltip>
        <a-tooltip trigger="hover" placement="right">
          <template #title>
            <div class="display: flex;align-items: center">
              <span>Crop the first object</span>
              <i
                style="
                  display: inline-block;
                  margin: 0 5px;
                  font-size: 14px;
                  transform: translateY(1px);
                "
                class="iconfont icon-hotkey"
              ></i>
              <span>{{ crop2Keyboard }}</span>
            </div>
          </template>
          <div class="float-item" @click.stop="onTool('clipPolygon', true)">
            <i class="iconfont icon-crop-first" style="font-size: 20px"></i>
            <span class="item-title">Crop2</span>
          </div>
        </a-tooltip>
      </div>
    </div>
  </div>
  <div class="pc-editor-tool tool-bottom">
    <a-tooltip placement="rightBottom" trigger="click" overlayClassName="tool-info-tooltip">
      <template #title>
        <Setting />
      </template>
      <span class="tool-item" title=""><i class="iconfont icon-setting"></i> </span>
    </a-tooltip>
    <Rotate />
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import _, { isNumber } from 'lodash';
  import { useInjectEditor } from '../../context';
  import { IToolItemConfig, Event, Polygon, OPType } from '../../../image-editor';
  import useTool from './useTool';

  import ToolItem from './components/ToolItem.vue';
  import Setting from './components/Setting.vue';
  import Rotate from './components/Rotate.vue';

  const editor = useInjectEditor();
  const { toolState, updateCustomHotkey, onTool } = useTool();
  const container = ref<HTMLDivElement>();

  const state = reactive({
    showTool: false,
    showHollowTool: false,
    showCancelHollow: false,
    showCutTool: false,
    dragItem: undefined as IToolItemConfig | undefined,
    dropItem: undefined as IToolItemConfig | undefined,
    position: -1,
    showDragLine: false,
    holderY: 0,
  });

  editor.on(Event.SELECT, (data) => {
    // if (editor.state.modeConfig.op === OPType.VIEW) {
    //   state.showTool = false;
    //   return;
    // }
    const selection = editor.selection;
    const polygons = selection.filter((e) => e instanceof Polygon) as Polygon[];
    const len = polygons.length;
    state.showCutTool = len > 1;
    state.showHollowTool = len > 1;
    state.showCancelHollow = len === 1 && polygons[0].attrs.innerPoints?.length > 0;
    state.showTool = state.showCutTool || state.showCancelHollow || state.showHollowTool;
  });

  const isMac = false;
  // Title ----------------
  const crop1Keyboard = 'X';
  const crop2Keyboard = isMac ? '⌘ + X' : 'Ctrl + X';
  // drag
  const throttleConfig = {
    leading: true,
    trailing: false,
  };

  const throttleTm = 100;
  const handleDragstart = (evt: MouseEvent, item: IToolItemConfig) => {
    // console.log('dragstart===================:', item);
    state.dragItem = item;
  };
  const handleDragend = () => {
    // console.log('dragend===================');
    const { dragItem, dropItem } = state;
    // console.log(`${dragItem?.name} => ${dropItem?.name}`, position);
    if (!dragItem || !dropItem) return;

    dragItem.name !== dropItem.name && handleDrop();
    state.dragItem = undefined;
    state.dropItem = undefined;
    state.showDragLine = false;
  };
  const onDragOver = _.throttle(
    (e: MouseEvent, item: IToolItemConfig) => {
      if (!container.value || !e.currentTarget) return;

      state.dropItem = item;
      state.showDragLine = true;

      const currentTarget = e.currentTarget as HTMLDivElement;
      const pRect = container.value.getBoundingClientRect();
      const rect = currentTarget.getBoundingClientRect();
      const { clientY } = e;
      let relativeY = clientY - rect.top;

      relativeY = relativeY / rect.height;

      const topY = rect.top - pRect.top;
      const bottomY = rect.bottom - pRect.top;

      const position = relativeY < 0.5 ? -1 : 1;
      const holderY = position === -1 ? topY : bottomY;
      state.holderY = holderY;
      state.position = position;
    },
    throttleTm,
    throttleConfig,
  );
  function handleDrop() {
    // console.log(evt);
    const { dragItem, dropItem } = state;
    if (!dragItem || !dropItem) return;
    const dragIdx = isNumber(dragItem.order) ? dragItem.order : -1;
    const dropIdx = isNumber(dropItem.order) ? dropItem.order : -1;
    if (dragIdx === -1 || dropIdx === -1) return;
    toolState.value.toolItems.splice(dragIdx, 1);
    toolState.value.toolItems.splice(dropIdx, 0, dragItem);
    updateCustomHotkey(toolState.value.toolItems);
  }
</script>

<style lang="less">
  .pc-editor-tool {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 50px;

    .divider {
      border-top: 1px dashed #bdbdbd;
      width: 38px;
      vertical-align: middle;
    }

    .drag-tool-list {
      position: relative;

      .drag-line {
        position: absolute;
        top: 10px;
        right: 0;
        left: 0;
        margin-top: -1px;
        height: 2px;
        background: #57ccef;
      }
    }

    .item-float-content {
      display: flex;
      position: absolute;
      top: 60px;
      left: 60px;
      padding: 10px 0;
      border-radius: 6px;
      z-index: 1;
      justify-content: space-around;
      align-items: center;
      width: 46px;
      background-color: #3a3a3e;
      box-shadow: 0 6px 15px rgb(0 0 0 / 15%);
      flex-direction: column;

      .cut-tool-content {
        margin-top: 10px;
        padding-top: 10px;
        width: 100%;
        border-top: 1px solid #a1a1a1;
      }

      .float-item {
        display: flex;
        justify-content: space-around;
        align-items: center;
        flex-direction: column;
        cursor: pointer;

        &:hover {
          color: #57ccef;

          .iconfont {
            color: inherit;
          }
        }
      }

      .item-title {
        padding: 4px 0;
        font-size: 12px;
      }

      .item-img {
        width: 24px;
      }
    }

    .item-float-config {
      position: absolute;
      top: 10px;
      left: 60px;
      border-radius: 6px;
      z-index: 1;
      background-color: #3a3a3e;
    }
  }

  .tool-top {
    overflow-y: auto;
    max-height: calc(100% - 120px);
  }

  .tool-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 120px;
    flex-direction: column-reverse;
  }

  .annotation-loading,
  .annotation-ai1 {
    height: 24px;
  }

  .tool-info-tooltip {
    padding: 4px;
    border-radius: 4px;
    overflow-y: auto;
    width: 300px;
    max-width: 300px;
    min-height: 100px;
    max-height: 95vh;
    background: #333333;
    font-size: 12px;
    color: #bec1ca;

    .ant-slider-handle {
      border: solid 2px #2e8cf0;
      background-color: #ffffff;
    }

    .ant-slider-track {
      background-color: #2e8cf0;
    }

    .ant-tooltip-arrow {
      display: none;
    }

    .ant-tooltip-content {
      position: relative;

      .close {
        position: absolute;
        top: 6px;
        right: 6px;
        font-size: 20px;
        cursor: pointer;
      }
    }

    .wrap {
      padding-left: 8px;
    }

    .title1 {
      // font-weight: bold;
      font-size: 16px;
      text-align: center;
      color: white;
      line-height: 36px;
    }

    .title2 {
      // font-weight: 600;
      font-size: 12px;
      line-height: 30px;
      color: white;
    }

    .title3 {
      font-size: 12px;
      line-height: 26px;
    }
  }

  .tool-trigger {
    display: flex;
    padding-bottom: 2px;
    justify-content: center;
    width: 38px;
    background-color: #1e1f22;
  }
</style>
