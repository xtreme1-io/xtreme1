<template>
  <div
    @click="onTool('click', $event)"
    :class="{
      ...getOpClassKV(data),
      item: true,
      active: select[data.id] || select[data.trackId],
      'no-object': !data.hasObject,
    }"
  >
    <div class="item-header">
      <span class="item-header-name">
        <span v-if="classInvalid(data.id)" :title="t('image.Class Invalid')">
          <warning-outlined style="color: #fcb17a" /> &nbsp;
        </span>
        <span v-if="!data.hasObject" :title="data.trackId">
          <question-circle-outlined style="color: #fcb17a" /> &nbsp;
        </span>
        {{ '#' + data.name }}
        <span v-show="data.infoLabel" class="info">({{ data.infoLabel }})</span>
        <span
          class="no-true-info"
          :title="t('image.Not True-Value')"
          v-show="!data.trueValue && data.hasObject"
        ></span>
      </span>

      <!-- tool -->
      <div class="extra-tool" style="padding-right: 0">
        <PlusOutlined v-if="!data.hasObject" title="Add" @click.stop="onAdd" v-show="editable" />
        <template v-else>
          <EditOutlined title="Edit" @click.stop="onTool('edit')" class="tool-icon" />
          <template v-if="!data._deleted">
            <EyeOutlined
              class="tool-icon"
              @click.stop="onTool('toggleVisible')"
              v-if="data.visible"
            />
            <EyeInvisibleOutlined class="tool-icon" @click.stop="onTool('toggleVisible')" v-else />
          </template>

          <template v-if="editable">
            <DeleteOutlined
              class="tool-icon"
              v-if="data.data.length === 0"
              @click.stop="itemHandler.onAction('delete', data)"
            />
            <IconCrop
              v-else
              @click.stop="groupHandler.onAction('ungroup', data)"
              class="tool-icon"
            />
          </template>
        </template>
      </div>
    </div>
    <div class="sub-item-wrap" v-if="data.data.length > 0">
      <SubItem
        v-for="item in data.data"
        :key="data.id + '##' + item.id"
        :editable="editable && !!data.hasObject"
        :data="item"
        :parent="data"
        @tool="onItemTool"
      />
    </div>
    <div v-show="data.attrLabel">
      <AttrLabel :editor="editor" :attrs="data.attrLabel" />
    </div>
    <div v-show="data.sizeLabel">
      <div class="props">{{ data.sizeLabel }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    EditOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    DeleteOutlined,
    PlusOutlined,
    WarningOutlined,
    QuestionCircleOutlined,
  } from '@ant-design/icons-vue';
  import { IconCrop } from '@basicai/icons';
  import { IItem, IAction, IClass } from '../type';
  import { useInjectEditor } from 'image-ui/context';
  import SubItem from './SubItem.vue';
  import { useInject } from '../context';
  import AttrLabel from '../VNodeAttrLabel';
  import { t } from '@/lang';

  const editor = useInjectEditor();
  // ***************Props and Emits***************
  const emit = defineEmits(['tool', 'group-tool']);
  const props = defineProps<{
    data: IItem;
    parentData: IClass[];
    select: Record<string, true>;
    editable: boolean;
  }>();
  // *********************************************

  const { trackHandler, itemHandler, groupHandler } = useInject();

  function onItemTool(...args: any[]) {
    emit('tool', ...args);
  }

  function onAdd() {
    trackHandler.onAction('add', props.data);
  }

  function onTool(action: IAction, event?: MouseEvent) {
    if (props.data.data.length === 0) {
      itemHandler.onAction(action, props.data, { event, list: props.parentData, mode: 'list' });
    } else {
      groupHandler.onAction(action, props.data, { event, list: props.parentData, mode: 'list' });
    }
  }
  function classInvalid(id: string): boolean {
    const obj = editor.dataManager.getObject(id);
    const invalid = (obj?.userData.limitState || '') !== '';
    return invalid;
  }
  function getOpClassKV(item: IItem) {
    const classKV: Record<string, boolean> = {};
    if (item._log_op) {
      classKV[item._log_op] = true;
    }
    return classKV;
  }
</script>

<style lang="less" scoped>
  .attrs-item + .attrs-item {
    border-left: 1px solid rgb(0 157 255);
  }

  .item {
    padding: 0 4px 0 10px;
    font-size: 14px;
    color: #bec1ca;
    cursor: pointer;

    &.create {
      box-shadow: 0 0 1px 1px #52c41a inset;
    }

    &.edit {
      box-shadow: 0 0 1px 1px #6283fa inset;
    }

    &.delete {
      box-shadow: 0 0 1px 1px #ff0000 inset;
      text-decoration-line: line-through;
      text-decoration-color: #ff0000;
    }

    &:first-child {
      border-top: none;

      .item-header {
        border-top: none;
      }
    }

    .item-header-name {
      display: flex;
      align-items: center;

      .no-true-info {
        display: inline-block;
        margin-left: 4px;
        width: 50px;
        height: 14px;
        background: linear-gradient(to right, transparent 50%, #8f8f8f 50%);
        background-size: 4px 100%;
      }

      .info {
        margin-left: 4px;
        font-size: 12px;
        color: #afafaf;
      }
    }

    .item-header {
      display: flex;
      padding-left: 4px;
      justify-content: space-between;
      align-items: center;
      height: 36px;
      border-top: 1px solid #cccccc2b;

      .item-header-icon {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;

        .tool-icon {
          width: 12px;
          height: 12px;
          font-size: 12px;
          // margin-left: 6px;
          // margin-top: 10px;
          // line-height: 1;
        }
      }
    }

    .sub-item-wrap {
      display: flex;
      padding-left: 20px;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    .props {
      display: inline-block;
      margin-bottom: 4px;
      padding: 2px 6px;
      border-radius: 4px;
      overflow: hidden;
      max-width: 224px;
      background: #45454b;
      font-size: 12px;
      color: #bec1ca;
      line-height: 16px;
      word-wrap: break-word;
    }

    .item-attrs {
      line-height: 1.4;
      padding: 4px 0;
      // border-top: 1px solid #4a4a4a;
      .attrs-item {
        padding: 0 5px;
      }
    }

    &:hover {
      background: #353841;

      .tool-icon {
        display: block;
        color: white;
      }
    }

    &.no-object {
      // background: #494949 !important;
      background: #494949;
    }

    &.invisible {
      .tool-icon {
        display: block;
      }
    }

    &.active {
      background: #424d6d;
    }
  }
</style>
