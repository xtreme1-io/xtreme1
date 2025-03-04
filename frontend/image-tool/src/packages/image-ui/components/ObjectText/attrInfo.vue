<template>
  <div class="attr-info">
    <div
      class="info-label"
      v-for="item in data"
      :key="item.id"
      :style="{
        transform: `translate(${item.x}px, ${item.y}px) translate(0,${item.type * 100}%)`,
      }"
    >
      <AttrLabel class="attr-item" :item="item" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { VNode, h } from 'vue';
  import { useInjectEditor } from '../../context';
  import { IAttrText } from './useAttr';
  import { t } from '@/lang';

  interface IProps {
    data: IAttrText[];
  }

  const editor = useInjectEditor();
  defineProps<IProps>();

  const AttrLabel = (data: { item: IAttrText }) => {
    const nodes: VNode[] = [];
    const userData = data.item.userData;
    const _attrs = Object.keys(userData?.attrs || {});
    if (_attrs.length > 0) {
      const attrMap = editor.attrMap;
      _attrs.forEach((attrId) => {
        const attr = attrMap.get(attrId);
        const value = userData && userData.attrs ? userData.attrs[attrId] : {};
        let valueStr = String(value.value || '');
        if (attr.latexExpression) {
          nodes.push(
            h('div', {}, [
              `${editor.showNameOrAlias(attr)}: `,
              h('span', {
                style: 'display: inline-block',
                innerHTML: editor.utils.toMMl(valueStr),
              }),
            ]),
          );
          return;
        } else if (attr && attr.options && valueStr) {
          const valArr = valueStr.split(',');
          valArr.forEach((str: string, index: number) => {
            const obj = attr.options.find((e: any) => e.name === str);
            if (obj) valArr[index] = editor.showNameOrAlias(obj);
          });
          valueStr = String(valArr);
        }
        nodes.push(h('div', {}, `${editor.showNameOrAlias(attr)}: ${valueStr}`));
      });
    } else {
      nodes.push(h('div', {}, `${t('image.No Attritube')}`));
    }
    return h('div', nodes);
  };
</script>

<style lang="less" scoped>
  .attr-info {
    position: absolute;
    pointer-events: none;
  }

  .info-label {
    position: absolute;
    padding: 3px 6px;
    border-radius: 4px;
    max-height: 330px;
    background: #3e4047;
    font-size: 12px;
    color: white;
    line-height: 22px;
    pointer-events: none;
    transform-origin: 0 110%;
  }

  .attr-item {
    width: max-content;
    max-width: 600px;
    text-align: left;
    white-space: normal;
    overflow-wrap: break-word;
    word-break: keep-all;
  }
</style>
