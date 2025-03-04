<template>
  <div class="result-layer-custom" ref="container">
    <template v-if="state.currentList.layerData.length">
      <div class="drag-list">
        <template v-for="item in state.currentList.layerData" :key="item.id">
          <GroupItems
            :item="item"
            :container="container"
            :parentData="state.currentList.layerData"
            @onDragStart="handleDragStart"
            @onDragOver="handleDragOver"
            @onDragEnd="handleDragEnd"
          ></GroupItems>
        </template>
      </div>
      <div
        class="holder"
        v-show="iState.holderVisible"
        :style="{ left: iState.holderX + 'px', top: iState.holderY + 'px' }"
      ></div>
    </template>
    <div v-else>{{ t('image.no-data') }}</div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { throttle } from 'lodash';
  import GroupItems from './GroupItems.vue';
  import { useInject } from '../context';
  import { AnnotateObject, GroupObject, ToolType } from 'image-editor';
  import { useInjectBSEditor } from '../../../../context';
  import { t } from '@/lang';
  import { IItem } from '../type';

  interface IState {
    holderVisible: boolean;
    holderX: number;
    holderY: number;
    dropItem?: IItem;
    dragItem?: IItem;
    position: number;
    dropToGroup: boolean;
  }

  const editor = useInjectBSEditor();
  const { state } = useInject();
  const container = ref<HTMLDivElement>();
  const iState = reactive<IState>({
    holderVisible: false,
    holderX: 0,
    holderY: 0,
    dropItem: undefined as IItem | undefined,
    dragItem: undefined as IItem | undefined,
    position: -1,
    dropToGroup: false,
  });
  // drag
  const throttleConfig = {
    leading: true,
    trailing: false,
  };
  const throttleTm = 200; // 拖拽节流间隔
  let dragCount = 0;

  function handleDragStart(data: IItem) {
    iState.dragItem = data;
  }
  function handleDragEnd() {
    const { dragItem, dropItem } = iState;
    if (!dragItem || !dropItem) return;

    dragItem.name !== dropItem.name && handleDrop();
    iState.dragItem = undefined;
    iState.dropItem = undefined;
    iState.holderVisible = false;
  }
  const handleDragOver = throttle(
    (e: DragEvent, item: IItem) => {
      if (!container.value || !e.currentTarget) return;
      iState.holderVisible = true;
      iState.dropItem = item;
      const currentTarget = e.currentTarget as HTMLDivElement;
      const pRect = container.value.getBoundingClientRect();
      const rect = currentTarget.getBoundingClientRect();
      const { clientX, clientY } = e;
      let relativeX = clientX - rect.left;
      let relativeY = clientY - rect.top;

      relativeX = relativeX / rect.width;
      relativeY = relativeY / rect.height;

      const topY = rect.top - pRect.top;
      const bottomY = rect.bottom - pRect.top;

      const position = relativeY < 0.5 ? -1 : 1;
      const holderY = position === -1 ? topY : bottomY;

      const dropToGroup = item.toolType == ToolType.GROUP && relativeX > 0.3 && position === 1;
      let object = getObject(item.id);
      let holderX = 0;
      let hasParent = object.groups.length > 0;
      dragCount++;
      const count = dragCount;
      while (hasParent && object && count === dragCount) {
        holderX += 20;
        object = object.groups[0];
        hasParent = object.groups.length > 0;
      }

      iState.holderX = holderX;
      iState.holderY = holderY;
      iState.position = position;
      iState.dropToGroup = dropToGroup;
    },
    throttleTm,
    throttleConfig,
  );
  function getObject(id: string) {
    return editor.dataManager.getObject(id) as AnnotateObject;
  }
  function handleDrop() {
    // console.log(evt);
    const { dragItem, dropItem, dropToGroup } = iState;

    if (!dragItem || !dropItem || dragItem.id === dropItem.id) return;

    let index = 0;
    let offset = 0;
    const dropPosition = iState.position;
    const node = getObject(dropItem.id);
    const dragObject = getObject(dragItem.id);

    let relNode = undefined;
    let group = undefined as AnnotateObject | undefined;
    if (dropToGroup) {
      group = node;
      index = 0;
    } else {
      offset = dropPosition === -1 ? 0 : 1;
      relNode = node;
      group = node.groups[0];
    }
    changeLayer({ relNode, dragObject, group, index, offset });
  }
  function changeLayer(config: any) {
    const relNode = config.relNode as AnnotateObject;
    const dragObject = config.dragObject as AnnotateObject;
    const group = config.group as GroupObject;
    const offset = config.offset as number;
    const index = config.index as number;

    let insertIndex = relNode ? findIndex(dragObject, relNode, group) : index;
    insertIndex += offset;

    editor.cmdManager.execute('move-object-index', {
      object: dragObject,
      index: insertIndex,
      into: group,
      from: dragObject.groups[0],
    });
  }
  function findIndex(currentNode: AnnotateObject, relNode: AnnotateObject, group: GroupObject) {
    let index = -1;
    let children = [] as AnnotateObject[];
    if (group) {
      children = [...group.member];
    } else {
      const frame = editor.getCurrentFrame();
      children = editor.dataManager.getFrameObject(frame.id) || [];
    }

    children = children.filter((e) => e !== currentNode);
    index = children.findIndex((e) => e === relNode);
    return index;
  }
</script>

<style lang="less">
  .result-layer-custom {
    position: relative;
    height: 100%;

    .holder {
      position: absolute;
      top: 10px;
      right: 0;
      left: 0;
      margin-top: -1px;
      height: 2px;
      background: @primary-color;
    }

    .drag-list {
      padding: 0;
      list-style: none;

      .drag-move {
        transition: transform 0.3s;
      }

      li {
        cursor: pointer;

        &:hover {
          background: #353841;
        }
      }

      .item-components {
        padding-left: 20px;
        // &:hover {
        //     background: #353841;
        // }
      }
    }
  }
</style>
