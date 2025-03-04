<template>
  <div
    :class="{
      ...getOpClassKV(data),
      'layer-item': true,
      active: state.selectMap[data.id],
    }"
    @click="onTool('click', $event)"
  >
    <span class="name">
      {{ `#${data.name}` }}
    </span>

    <ToolIcon :style="{ color: data.color, margin: '0 4px' }" :tool="(data.icon as any)" />
    <span v-show="data.infoLabel" class="info">({{ data.infoLabel }})</span>
    <span class="limit" :title="getTitle(data)"> {{ getItemClassName(data) }}</span>
    <warning-outlined
      v-if="classInvalid(data.id)"
      style="color: #fcb17a"
      :title="t('image.Class Invalid')"
    />
    <!-- <span class="type limit" :style="{ color: data.color }">{{ data.classType }}</span> -->
    <div class="extra-tool">
      <!-- edit -->
      <EditOutlined title="Edit" @click.stop="onTool('edit')" class="tool-icon" />
      <template v-if="!data._deleted">
        <!-- visible -->
        <EyeOutlined class="tool-icon" @click.stop="onTool('toggleVisible')" v-if="data.visible" />
        <EyeInvisibleOutlined class="tool-icon" @click.stop="onTool('toggleVisible')" v-else />
      </template>

      <!-- delete -->
      <DeleteOutlined v-show="editable" class="tool-icon" @click.stop="onTool('delete')" />
    </div>
    <div v-if="config.showAttrs && attrLabel">
      <AttrLabel :editor="editor" :attrs="attrLabel" />
    </div>
    <div v-if="config.showSize && sizeLabel">
      <div class="props">{{ sizeLabel }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { IItem, IAction } from '../type';
  import { useInject } from '../context';
  import {
    EditOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    DeleteOutlined,
    WarningOutlined,
  } from '@ant-design/icons-vue';
  import { IClassTypeItem, ToolIcon } from 'image-editor';
  import { t } from '@/lang';
  import { useInjectEditor } from 'image-ui/context';
  import AttrLabel from '../VNodeAttrLabel';
  import { getObjectInfo } from '../utils';

  interface IProps {
    parentData: IItem[];
    data: IItem;
    editable: boolean;
  }
  const props = defineProps<IProps>();
  const editor = useInjectEditor();
  const config = editor.state.config;
  // const emit = defineEmits(['onItemClick']);

  const attrLabel = computed(() => {
    let attrLabel: any = '';
    if (config.showAttrs) {
      const obj = editor.dataManager.getObject(props.data.id);
      if (!obj) return attrLabel;
      const userData = editor.getUserData(obj);
      const classId = userData.classId || '';
      const classConfig = editor.getClassType(classId);
      if (classConfig) attrLabel = editor.getValidAttrs(userData);
    }
    return attrLabel;
  });
  const sizeLabel = computed(() => {
    let sizeLabel = '';
    if (config.showSize) {
      const obj = editor.dataManager.getObject(props.data.id);
      if (!obj) return sizeLabel;
      const infos = getObjectInfo(obj);
      if (infos.length > 0) sizeLabel = infos.join(' | ');
    }
    return sizeLabel;
  });
  function classInvalid(id: string): boolean {
    const obj = editor.dataManager.getObject(id);
    const invalid = (obj?.userData.limitState || '') !== '';
    return invalid;
  }

  const { state, itemHandler, groupHandler } = useInject();

  function onTool(action: IAction, event: MouseEvent) {
    if (props.data.data.length === 0) {
      itemHandler.onAction(action, props.data, { event, list: props.parentData, mode: 'layer' });
    } else {
      groupHandler.onAction(action, props.data, { event, list: props.parentData, mode: 'layer' });
    }
  }
  function getTitle(item: IItem | IClassTypeItem): string {
    const config = item instanceof IClassTypeItem ? item : editor.getClassType(item.classId);
    if (config) {
      if (config.parent) {
        return `${getTitle(config.parent)}/${editor.getLabel(config)}`;
      } else {
        return editor.getLabel(config);
      }
    } else {
      return (item as IItem).classType;
    }
  }
  function getItemClassName(item: IItem) {
    const config = editor.getClassType(item.classId);
    return config ? editor.getLabel(config) : t('image.Class Required');
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
  .layer-item {
    display: flex;
    padding-left: 6px;
    align-items: center;
    width: 100%;
    min-height: 36px;
    line-height: 36px;
    border-bottom: 1px solid #525252;
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

    .limit {
      flex: 1;
    }

    > span {
      display: block;
    }

    &:hover {
      background: #353841;

      .tool-icon {
        display: block;
        color: white;
      }
    }

    .props {
      display: inline-block;
      margin-bottom: 4px;
      padding: 2px 4px;
      border-radius: 4px;
      background: #45454b;
      font-size: 12px;
      color: #bec1ca;
      line-height: 16px;
      word-wrap: break-word;
    }

    .type {
      margin-left: 4px;
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
