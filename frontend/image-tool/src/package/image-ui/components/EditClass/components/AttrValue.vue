<template>
  <div class="attr-item-content" :sign-attr-id="item.id">
    <div class="name" :span="10">
      {{ (props.preName ? props.preName + ' & ' : '') + item.name }}
      <span v-if="item.type === AttrType.RADIO || item.type === AttrType.MULTI_SELECTION">
        {{ item.type === AttrType.RADIO ? '(Radio)' : '(CheckBox)' }}
      </span>
      <span v-if="item.latexExpression">
        {{ '(LaTeX)' }}
      </span>
    </div>
    <div class="value" :span="14">
      <Radio
        :disabled="props.isDisable"
        :name="item.id"
        v-model:value="item.value"
        @change="onAttChange"
        :options="transformOptions(item.options)"
        v-if="item.type === AttrType.RADIO"
      />
      <Select
        :disabled="props.isDisable"
        :name="item.id"
        v-model:value="item.value"
        @change="onAttChange"
        :options="transformOptions(item.options)"
        v-else-if="item.type === AttrType.DROPDOWN"
      />
      <Text
        :disabled="props.isDisable"
        :name="item.id"
        v-model:value="item.value"
        @change="onAttChange"
        v-else-if="item.type === AttrType.TEXT"
      />
      <Check
        :disabled="props.isDisable"
        :name="item.id"
        v-model:value="item.value"
        @change="onAttChange"
        :options="transformOptions(item.options)"
        v-else-if="item.type === AttrType.MULTI_SELECTION"
      />
    </div>
  </div>

  <div v-if="curOptions && curOptions.length > 0">
    <div class="attr-extra" v-for="option in curOptions" :key="option.id">
      <div class="attr-item" v-for="optionAttr in option.attributes" :key="optionAttr.id">
        <AttrValue
          @change="onOptionAttChange"
          :item="(optionAttr as any)"
          :preName="editor.showNameOrAlias(option)"
          :isDisable="isDisable"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import { AttrType, IAttr, IAttrOption } from '../../../../image-editor';
  import { useInjectEditor } from '../../../context';
  import Radio from '../../common/Radio.vue';
  import Check from '../../common/Check.vue';
  import Select from '../../common/Select.vue';
  import Text from '../../common/Text.vue';

  interface IProps {
    item: IAttr;
    isDisable: boolean;
    preName?: string;
  }
  const props = defineProps<IProps>();

  const emit = defineEmits(['change', 'toggle', 'validate']);

  const editor = useInjectEditor();

  const optionVals = computed(() => {
    return props.item.options.map((option) => {
      return option.name;
    });
  });

  const curOptions = ref<IAttrOption[]>([]);
  function transformOptions(options: IAttrOption[]) {
    return options.map((o) => {
      return {
        name: o.name,
        alias: o.alias,
        value: o.name,
        id: o.id,
      };
    });
  }
  function onAttChange(name: string, value: any) {
    checkCurOptions(value);
    const oriAttr = editor.attrMap.get(props.item.id);
    const data = {
      id: props.item.id,
      name: props.item.name || '',
      pid: oriAttr.parent,
      alias: oriAttr.alias,
      isLeaf: Boolean(oriAttr.parent),
      attributeVersion: oriAttr.attributeVersion,
      value,
    };
    emit('change', name, data);
  }
  function onOptionAttChange(name: string, value: any) {
    emit('change', name, value);
  }

  function checkCurOptions(value: any) {
    if (!value) {
      curOptions.value = [];
      return;
    }
    const optionAttrs = [] as IAttrOption[];
    if (props.item.type !== AttrType.TEXT) {
      const values = Array.isArray(value) ? value : [value];
      values.forEach((val: string) => {
        const idx = optionVals.value.indexOf(val);
        if (
          idx > -1 &&
          props.item.options[idx] &&
          props.item.options[idx].attributes &&
          (props.item.options[idx].attributes?.length || 0) > 0
        ) {
          optionAttrs.push(props.item.options[idx]);
        }
      });
    }
    curOptions.value = optionAttrs;
  }
  watch(
    () => props.item,
    () => {
      checkCurOptions(props.item.value);
    },
    { immediate: true },
  );
</script>
<style lang="less">
  .attr-item-content {
    padding: 5px 10px;
  }

  .attr-extra {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }
</style>
