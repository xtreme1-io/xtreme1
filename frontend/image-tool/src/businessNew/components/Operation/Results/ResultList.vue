<template>
  <div class="result-data-list">
    <a-collapse
      style="margin: 0; border: none !important"
      v-model:activeKey="resultState.activeClass"
      :bordered="false"
      :openAnimation="animation"
    >
      <template #expandIcon="{ isActive }: any">
        <CaretRightOutlined :rotate="isActive ? 90 : 0" />
      </template>
      <a-collapse-panel v-for="item in resultState.list" :key="item.key">
        <div class="list">
          <Item
            v-for="objItem in item.data"
            :key="objItem.key"
            :data="objItem"
            :select="resultState.selectMap"
            :editable="canEdit()"
          />
        </div>
        <template #header>
          <div>
            <span class="class-title limit" :style="{ color: item.color }">
              {{ item.name }}
            </span>
            <span>{{ `(${item.data.length})` }}</span>
          </div>
        </template>
        <template #extra>
          <i class="icon iconfont icon-model" v-if="item.isModel" />
          <ToolIcon v-else-if="item.classType" :tool="item.toolType" />
          <warning-outlined v-else style="color: #fcb17a" />
          <div class="extra-tool" v-show="item.data.length > 0">
            <EditOutlined
              v-if="item.classType"
              title="Edit"
              @click.stop="classHandler.onAction(IAction.edit, item)"
              class="tool-icon"
            />
            <EyeOutlined
              class="tool-icon"
              @click.stop="classHandler.onAction(IAction.toggleVisible, item)"
              v-if="item.visible"
            />
            <EyeInvisibleOutlined
              class="tool-icon"
              @click.stop="classHandler.onAction(IAction.toggleVisible, item)"
              v-else
            />
            <DeleteOutlined
              v-show="canEdit()"
              class="tool-icon"
              @click.stop="classHandler.onAction(IAction.delete, item)"
            />
          </div>
        </template>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
  import {
    CaretRightOutlined,
    EditOutlined,
    WarningOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    DeleteOutlined,
  } from '@ant-design/icons-vue';
  import { useResultsInject } from './context';
  import { animation } from './useList';
  import { ToolIcon } from 'image-editor';
  import useUI from '../../../hook/useUI';
  import { IAction } from './type';
  import Item from './components/Item.vue';

  const { resultState, classHandler } = useResultsInject();
  const { canEdit } = useUI();
</script>

<style lang="less" scoped>
  .result-data-list {
    position: relative;
    height: 100%;
    margin-bottom: unset;
    border: 0 !important;
    border-radius: 4px;
    background-color: #303036 !important;
    .list {
      overflow: hidden;
    }

    .class-title {
      display: inline-block;
      margin-left: 16px;
      max-width: 100px;
      vertical-align: middle;
    }

    .header-highlight {
      position: absolute;
      inset: 0;
      padding-left: 33px;
      line-height: 39px;

      &.active {
        background: #455a9580;
      }
    }

    .ant-collapse-arrow {
      display: none;
    }

    .ant-collapse-item {
      margin-bottom: 3px;
      border: 1px solid #1e1f22;
      border-radius: 4px 4px 5px 5px;
      border-bottom: 0;

      &.ant-collapse-item-active {
        border: 1px solid #1e1f22 !important;
      }

      :deep(.ant-collapse-header) {
        position: relative;
        padding-left: 10px;
        border-radius: 4px;
        background: #3e4047;
        font-size: 14px;
        color: #bec1ca;
        font-weight: 500;
        border-bottom: 1px solid #1e1f22;

        .ant-collapse-extra {
          position: absolute;
          inset: 0 0 0 28px;
          pointer-events: none;
          line-height: 40px;
        }
      }
    }
  }
</style>
