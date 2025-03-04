<template>
  <div :draggable="editable" @dragstart.stop="handleDragstart" @dragend.stop="handleDragend">
    <div @dragover.stop="handleDragOver($event)">
      <Item :data="item" :parentData="parentData" :editable="editable" />
    </div>
    <div v-if="item.data && item.data.length > 0" class="item-components">
      <template v-for="child in item.data" :key="child.id">
        <GroupItems
          :item="child"
          :container="container"
          :parentData="parentData"
          @onDragStart="handleEmitedDragstart"
          @onDragOver="handleEmitedDragOver"
          @onDragEnd="handleEmitedDragend"
        ></GroupItems>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { IItem } from '../type';
  import { useUI } from 'image-ui/hook';
  import Item from './Item.vue';

  interface IProps {
    item: IItem;
    parentData: IItem[];
    container?: HTMLDivElement;
  }
  const props = defineProps<IProps>();
  const emits = defineEmits(['onDragStart', 'onDragEnd', 'onDragOver']);

  const { canEdit } = useUI();
  const editable = computed(() => canEdit());

  function handleDragstart(_evt: DragEvent) {
    emits('onDragStart', props.item);
  }
  function handleDragend() {
    emits('onDragEnd');
  }
  function handleDragOver(_evt: DragEvent) {
    emits('onDragOver', _evt, props.item);
  }

  function handleEmitedDragstart(item: IItem) {
    emits('onDragStart', item);
  }
  function handleEmitedDragend() {
    emits('onDragEnd');
  }
  function handleEmitedDragOver(_evt: DragEvent, item: IItem) {
    emits('onDragOver', _evt, item);
  }
</script>
