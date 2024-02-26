<template>
  <Collapse header="Classifications">
    <div class="operation-classification">
      <template v-if="classifications.length > 0">
        <div class="classification-wrap" v-for="item in classifications" :key="item.id">
          <AttrValue
            v-for="attr in item.attrs"
            :key="attr.id + '#' + state.frameIndex"
            v-show="isAttrVisible(attr)"
            @change="onAttChange"
            :item="attr"
          />
        </div>
      </template>
      <div v-else class="no-info">{{ editor.lang('no-data') }}</div>
    </div>
  </Collapse>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useInjectBSEditor } from '../../../context';
  import { IClassificationAttr, IClassification } from '../../../types';
  import { isAttrTypeMulti } from '../../../utils';

  import AttrValue from './AttrValue.vue';
  import Collapse from '../../Collapse/index.vue';

  const editor = useInjectBSEditor();
  const { state } = editor;

  let attrMap = {} as Record<string, IClassificationAttr>;
  const classifications = computed(() => {
    let frame = editor.getCurrentFrame();
    let datas: IClassification[] = frame?.classifications || [];

    datas.forEach((e) => {
      e.attrs.forEach((attr) => {
        attrMap[attr.id] = attr;
      });
    });

    return datas;
  });

  function onAttChange(name: string, value: any) {
    let dataInfo = editor.getCurrentFrame();
    dataInfo.needSave = true;
  }

  function isItemVisible(attr: IClassificationAttr): boolean {
    let parentAttr = attrMap[attr.parent];
    return isAttrTypeMulti(parentAttr.type)
      ? (parentAttr.value as any[]).indexOf(attr.parentValue) >= 0
      : parentAttr.value === attr.parentValue;
  }

  function isAttrVisible(attr: IClassificationAttr): boolean {
    if (!attr.parent) return true;
    let parentAttr = attrMap[attr.parent];
    return isItemVisible(attr) && isAttrVisible(parentAttr);
  }
</script>

<style lang="less">
  .operation-classification {
    text-align: left;
    padding: 4px 10px;
    max-height: 350px;
    overflow: auto;
    position: relative;

    .attr-item {
      text-align: left;
      .name {
        font-size: 16px;
        line-height: 34px;
      }

      .value {
        padding: 4px 0px;
      }
    }
  }
</style>
