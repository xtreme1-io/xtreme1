<template>
  <Radio.Group v-model:value="imageLimit" button-style="solid" style="margin-bottom: 16px">
    <Radio.Button :value="imageConstraintsEnum.SIZE">
      {{ t('business.ontology.modal.constraints.size') }}
    </Radio.Button>
    <Radio.Button :value="imageConstraintsEnum.AREA">
      {{ t('business.ontology.modal.constraints.area') }}
    </Radio.Button>
  </Radio.Group>
  <div v-if="props.imageLimit == imageConstraintsEnum.SIZE">
    <div class="flex justify-between items-center mb-10px">
      <span class="whitespace-nowrap w-50px">
        {{ t('business.ontology.modal.constraints.length') }}
      </span>
      <div>
        <InputNumber
          placeholder="min"
          autocomplete="off"
          v-model:value="imageLength[0]"
          style="text-align: center; width: 50px; margin-right: 5px"
        />
        <span>
          {{ t('business.ontology.modal.constraints.unitImage') }}
        </span>
      </div>
      <div>
        <InputNumber
          placeholder="max"
          autocomplete="off"
          v-model:value="imageLength[1]"
          style="text-align: center; width: 50px; margin-right: 5px"
        />
        <span>
          {{ t('business.ontology.modal.constraints.unitImage') }}
        </span>
      </div>
    </div>
    <div class="flex justify-between items-center mb-10px">
      <span class="whitespace-nowrap w-50px">
        {{ t('business.ontology.modal.constraints.width') }}
      </span>
      <div>
        <InputNumber
          placeholder="min"
          autocomplete="off"
          v-model:value="imageWidth[0]"
          style="text-align: center; width: 50px; margin-right: 5px"
        />
        <span>
          {{ t('business.ontology.modal.constraints.unitImage') }}
        </span>
      </div>
      <div>
        <InputNumber
          placeholder="max"
          autocomplete="off"
          v-model:value="imageWidth[1]"
          style="text-align: center; width: 50px; margin-right: 5px"
        />
        <span>
          {{ t('business.ontology.modal.constraints.unitImage') }}
        </span>
      </div>
    </div>
  </div>
  <div v-if="props.imageLimit == imageConstraintsEnum.AREA">
    <div class="flex justify-between items-center mb-10px">
      <span class="whitespace-nowrap w-50px">
        {{ t('business.ontology.modal.constraints.area') }}
      </span>
      <div>
        <InputNumber
          placeholder="min"
          autocomplete="off"
          v-model:value="imageArea[0]"
          style="text-align: center; width: 50px; margin-right: 5px"
        />
        <span>
          {{ t('business.ontology.modal.constraints.unitImage') }}
        </span>
      </div>
      <div>
        <InputNumber
          placeholder="max"
          autocomplete="off"
          v-model:value="imageArea[1]"
          style="text-align: center; width: 50px; margin-right: 5px"
        />
        <span>
          {{ t('business.ontology.modal.constraints.unitImage') }}
        </span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Radio, InputNumber } from 'ant-design-vue';
  import { computed } from 'vue';
  import { imageConstraintsEnum } from '../attributes/data';

  const { t } = useI18n();

  const props = defineProps<{
    imageLimit?: imageConstraintsEnum;
    imageLength: [number, number];
    imageWidth: [number, number];
    imageArea: [number, number];
  }>();
  const emits = defineEmits([
    'update:imageLimit',
    'update:imageLength',
    'update:imageWidth',
    'update:imageArea',
  ]);

  const imageLimit = computed({
    get() {
      return props.imageLimit;
    },
    set(newVal) {
      emits('update:imageLimit', newVal);
    },
  });
  const imageLength = computed({
    get() {
      return props.imageLength;
    },
    set(newVal) {
      emits('update:imageLength', newVal);
    },
  });
  const imageWidth = computed({
    get() {
      return props.imageWidth;
    },
    set(newVal) {
      emits('update:imageWidth', newVal);
    },
  });
  const imageArea = computed({
    get() {
      return props.imageArea;
    },
    set(newVal) {
      emits('update:imageArea', newVal);
    },
  });
</script>
<style lang="less" scoped></style>
