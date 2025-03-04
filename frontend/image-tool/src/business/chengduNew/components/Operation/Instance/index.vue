<template>
  <Collapse>
    <template #header>
      <a-tooltip placement="bottom" trigger="hover">
        <template #title> {{ modeTips }} </template>

        <i :class="['instance-model-icon']" @click="onChangeMode()">
          <IconEntry v-if="state.listMode === 'list'" />
          <IconLayerMode v-else />
        </i>
      </a-tooltip>
      <Header :title="state.currentList.name" :state="state" />
    </template>
    <div class="operation-instance" ref="domRef">
      <div class="operation-instance-collapse">
        <DataLayer v-if="state.listMode === 'layer'" />
        <DataList v-else />
        <Menu />
      </div>
      <div v-show="!canOperate()" class="over-not-allowed"></div>
    </div>
  </Collapse>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import useUI from '../../../hook/useUI';
  import Header from './Header.vue';
  import Menu from './Menu.vue';
  import DataList from './List/DataList.vue';
  import DataLayer from './Layer/DataLayer.vue';
  import Collapse from '../../Collapse/index.vue';
  import { t } from '@/lang';
  import { useProvide } from './context';
  import useInstance from './useInstance';
  import useClass from './useClass';
  import useGroup from './useGroup';
  import useItem from './useItem';
  import useTrack from './useTrack';

  const { state, domRef, onChangeMode, onUpdateList } = useInstance();

  const classHandler = useClass();
  const groupHandler = useGroup();
  const itemHandler = useItem();
  const trackHandler = useTrack();

  useProvide({
    state,
    itemHandler,
    classHandler,
    groupHandler,
    trackHandler,
    onUpdateList,
  });

  const modeTips = computed(() => {
    return t('image.changeMode', {
      type: state.listMode === 'list' ? t('image.layer') : t('image.list'),
    });
  });

  const { canOperate } = useUI();
</script>

<style lang="less">
  .instance-model-icon {
    color: #60a9fe;
  }

  .operation-instance {
    position: absolute;
    inset: 0;
    padding: 8px 7px 10px;
    overflow: hidden overlay;
    // background: black;
    text-align: left;

    .operation-instance-collapse {
      position: relative;
      height: 100%;
      user-select: none;
    }

    .extra-tool {
      display: flex;
      padding-right: 4px;
      justify-content: end;
      align-items: center;
      pointer-events: visible;

      .tool-icon {
        margin-left: 7px;
        font-size: 14px;

        &:hover {
          color: @primary-color;
        }
      }
    }
  }
</style>
