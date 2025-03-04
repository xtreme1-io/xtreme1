<template>
  <div class="result-data-list">
    <a-collapse
      v-model:activeKey="state.currentList.activeClass"
      :bordered="false"
      :openAnimation="animation"
    >
      <template #expandIcon="{ isActive }: any">
        <CaretRightOutlined :rotate="isActive ? 90 : 0" />
      </template>
      <a-collapse-panel v-for="item in state.currentList.classData" :key="item.key">
        <div class="list">
          <Item
            v-for="subItem in item.data"
            :parentData="state.currentList.classData"
            :key="subItem.trackId"
            :data="subItem"
            :select="state.selectMap"
            :editable="canEdit()"
            :sign-attr-id="subItem.id"
          />
        </div>
        <template #header>
          <div :class="['header-highlight', { active: editor.state.currentClass === item.id }]">
            <div class="list-class-item" @click="onSetCurClass(item)">
              <IconModelsRunsFilter v-if="item.isModel" />
              <ToolIcon v-else-if="item.classType" :tool="(item.icon as any)" />
              <warning-outlined v-else style="color: #fcb17a" />
              <span
                class="class-title limit"
                :title="getTitle(item)"
                :style="{ color: item.color }"
              >
                {{ editor.getLabel(item) }}
              </span>
              <span>{{ `(${item.data.length})` }}</span>
              <div class="item-extra-tool">
                <div class="extra-tool" v-show="item.data.length > 0">
                  <EditOutlined
                    v-if="item.classType"
                    title="Edit"
                    @click.stop="classHandler.onAction('edit', item)"
                    class="tool-icon"
                  />
                  <EyeOutlined
                    class="tool-icon"
                    @click.stop="classHandler.onAction('toggleVisible', item)"
                    v-if="item.visible"
                  />
                  <EyeInvisibleOutlined
                    class="tool-icon"
                    @click.stop="classHandler.onAction('toggleVisible', item)"
                    v-else
                  />
                  <DeleteOutlined
                    v-show="canEdit()"
                    class="tool-icon"
                    @click.stop="classHandler.onAction('delete', item)"
                  />
                </div>
              </div>
            </div>
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
  import { IconModelsRunsFilter } from '@basicai/icons';
  import Item from './Item.vue';
  import { useInject } from '../context';
  import { animation } from '../useCommon';
  import { useUI } from 'image-ui/hook';
  import { useInjectBSEditor } from '../../../../context';
  import { IClass } from '../type';
  import { IClassTypeItem, ToolIcon } from 'image-editor';

  const { canEdit } = useUI();
  const editor = useInjectBSEditor();
  const { state, classHandler } = useInject();

  function onSetCurClass(item: IClass, select?: boolean) {
    if (editor.state.currentClass === item.id) return;
    editor.state.currentClass = item.id;
    if (select) return;
    editor.selectObject();
    editor.mainView.disableDraw();
  }
  function getTitle(item: IClass | IClassTypeItem): string {
    const config = item instanceof IClassTypeItem ? item : editor.getClassType(item.id);
    if (config) {
      if (config.parent) {
        return `${getTitle(config.parent)}/${editor.getLabel(config)}`;
      } else {
        return editor.getLabel(config);
      }
    } else {
      return (item as IClass).name;
    }
  }
</script>
<style lang="less" scoped>
  // i:hover {
  //     color: @primary-color;
  // }
  .result-data-list {
    margin-bottom: unset;
    // overflow: hidden;
    border: 0 !important;
    // border: 1px solid #1e1f22 !important;
    border-radius: 4px;
    background-color: transparent;
    background-color: #303036 !important;
    // 组项
    .list {
      overflow: hidden;
    }

    .class-title {
      display: block;
      margin-left: 4px;
      flex: 1;
    }

    .header-highlight {
      position: absolute;
      inset: 0;
      line-height: 39px;

      .list-class-item {
        display: flex;
        margin-left: 28px;
        align-items: center;

        .item-extra-tool {
          min-width: 64px;
        }
      }

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
        border-bottom: 1px solid #1e1f22;
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

    // .ant-collapse > .ant-collapse-item > .ant-collapse-header .ant-collapse-arrow {
    //     display: none;
    // }
  }
</style>
