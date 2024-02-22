<template>
  <div
    @click="onTool(IAction.click, $event)"
    :class="{
      item: true,
      active: select[data.id],
    }"
  >
    <div class="item-header">
      <span class="item-header-name">
        <span v-if="classInvalid(data.id)" :title="editor.lang('Class Invalid')">
          <warning-outlined style="color: #fcb17a" /> &nbsp;
        </span>
        {{ '#' + data.name }}
        <!-- <span v-show="data.infoLabel" class="info">({{ data.infoLabel }})</span>
        <span
          class="no-true-info"
          :title="editor.lang('Not True-Value')"
          v-show="!data.trueValue && data.hasObject"
        ></span> -->
      </span>

      <!-- tool -->
      <div class="extra-tool" style="padding-right: 0">
        <EditOutlined title="Edit" @click.stop="onTool(IAction.edit)" class="tool-icon" />
        <EyeOutlined
          class="tool-icon"
          @click.stop="onTool(IAction.toggleVisible)"
          v-if="data.visible"
        />
        <EyeInvisibleOutlined
          class="tool-icon"
          @click.stop="onTool(IAction.toggleVisible)"
          v-else
        />
        <template v-if="editable">
          <DeleteOutlined
            class="tool-icon"
            @click.stop="itemHandler.onAction(IAction.delete, data)"
          />
        </template>
      </div>
    </div>
    <div v-show="data.attrLabel && config.showAttrs">
      <AttrLabel :attrs="data.attrLabel" />
    </div>
    <div v-show="data.sizeLabel && config.showSize">
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
    WarningOutlined,
  } from '@ant-design/icons-vue';
  import { IAction, IObjectItem } from '../type';
  import { useInjectEditor } from 'image-ui/context';
  import { useResultsInject } from '../context';
  import { VNode, createVNode } from 'vue';

  // ***************Props and Emits***************
  const emit = defineEmits(['tool', 'group-tool']);
  const props = defineProps<{
    data: IObjectItem;
    select: Record<string, true>;
    editable: boolean;
  }>();
  type IProp = {
    attrs: any;
  };
  // *********************************************

  const editor = useInjectEditor();
  const { config } = editor.state;
  const { itemHandler } = useResultsInject();

  function onTool(action: IAction, event?: MouseEvent) {
    itemHandler.onAction(action, props.data, event?.shiftKey);
  }
  function classInvalid(id: string): boolean {
    const obj = editor.dataManager.getObject(id);
    const invalid = (obj?.userData.limitState || '') !== '';
    return invalid;
  }

  function AttrLabel(prop: IProp) {
    const { attrs = '' } = prop;
    const attrStrArr: (String | VNode)[] = [];
    if (typeof attrs === 'string') {
      attrStrArr.push(attrs);
    } else {
      const _attrs = Object.keys(attrs);
      const attrMap = editor.attrMap;
      _attrs.forEach((attrId, index) => {
        const attr = attrMap.get(attrId);
        const value = attrs ? attrs[attrId] : {};
        let valueStr = String(value.value || '');
        // if (attr.latexExpression) {
        //     attrStrArr.push(
        //         createVNode('span', {
        //             style: 'display: inline-block',
        //             innerHTML: editor.utils.toMMl(valueStr),
        //         }),
        //     );
        //     if (index < _attrs.length - 1) {
        //         attrStrArr.push(' | ');
        //     }
        //     return;
        // } else
        if (attr && attr.options && valueStr) {
          const valArr = valueStr.split(',');
          valArr.forEach((str: string, index: number) => {
            const obj = attr.options.find((e: any) => e.name === str);
            if (obj) valArr[index] = editor.showNameOrAlias(obj);
          });
          valueStr = String(valArr);
        }
        attrStrArr.push(valueStr);
        if (index < _attrs.length - 1) {
          attrStrArr.push(' | ');
        }
      });
    }
    return createVNode(
      'div',
      {
        style: {
          display: attrStrArr.length <= 0 ? 'none' : '',
          'word-wrap': 'break-word',
          width: '100%',
        },
        class: 'props',
      },
      attrStrArr,
    );
  }
</script>

<style lang="less" scoped>
  .attrs-item + .attrs-item {
    border-left: 1px solid rgb(0 157 255);
  }

  .item {
    padding: 0 10px;
    font-size: 14px;
    color: #bec1ca;
    cursor: pointer;

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
      background: #45454b;
      font-size: 12px;
      color: #bec1ca;
      line-height: 16px;
      word-wrap: break-word;
    }

    .annotation {
      line-height: 12px;
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

        &:hover {
          color: #ed4014;
        }
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
