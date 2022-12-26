<template>
  <div class="standard-container">
    <template v-if="props.isStandard">
      <div class="wrapper">
        <!-- length -->
        <div class="wrapper-item wrapper-standard-left">
          <span class="nowrap label-left">
            {{ t('business.ontology.modal.constraints.length') }}
          </span>
          <div class="nowrap">
            <InputNumber
              :min="minStandard"
              :max="maxStandard"
              :step="stepStandard"
              :precision="precisionStandard"
              autocomplete="off"
              v-model:value="length"
              style="text-align: center; width: 60px; margin-right: 5px"
            />
            <span>
              {{ t('business.ontology.modal.constraints.unitStandard') }}
            </span>
          </div>
        </div>
        <!-- width -->
        <div class="wrapper-item">
          <span class="nowrap label-right">
            {{ t('business.ontology.modal.constraints.width') }}
          </span>
          <div class="nowrap">
            <InputNumber
              :min="minStandard"
              :max="maxStandard"
              :step="stepStandard"
              :precision="precisionStandard"
              autocomplete="off"
              v-model:value="width"
              style="text-align: center; width: 60px; margin-right: 5px"
            />
            <span>
              {{ t('business.ontology.modal.constraints.unitStandard') }}
            </span>
          </div>
        </div>
      </div>
      <div class="wrapper">
        <!-- height -->
        <div class="wrapper-item wrapper-standard-left">
          <span class="nowrap label-left">
            {{ t('business.ontology.modal.constraints.height') }}
          </span>
          <div class="nowrap">
            <InputNumber
              :min="minStandard"
              :max="maxStandard"
              :step="stepStandard"
              :precision="precisionStandard"
              autocomplete="off"
              v-model:value="height"
              style="text-align: center; width: 60px; margin-right: 5px"
            />
            <span>
              {{ t('business.ontology.modal.constraints.unitStandard') }}
            </span>
          </div>
        </div>
        <!-- points -->
        <div class="wrapper-item">
          <span class="nowrap label-right">
            {{ t('business.ontology.modal.constraints.points') }}
          </span>
          <div class="nowrap">
            <InputNumber
              :min="minPoints"
              :max="maxPoints"
              :step="stepPoints"
              :precision="precisionPoints"
              autocomplete="off"
              v-model:value="points"
              style="text-align: center; width: 60px; margin-right: 19px"
            />
            <span></span>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="wrapper">
        <!-- length -->
        <div class="wrapper-item wrapper-left">
          <span class="nowrap label-left">
            {{ t('business.ontology.modal.constraints.length') }}
          </span>
          <div class="nowrap input-space">
            <InputNumber
              :min="minStandard"
              :max="maxStandard"
              :step="stepStandard"
              :precision="precisionStandard"
              @blur="handleStandardBlur(length, 0)"
              @change="handleStandardChange(length, 0)"
              placeholder="min"
              autocomplete="off"
              v-model:value="length[0]"
              style="text-align: center; width: 60px; margin-right: 5px"
            />
            <span>
              {{ t('business.ontology.modal.constraints.unitStandard') }}
            </span>
          </div>
          <div class="nowrap">
            <InputNumber
              :min="minStandard"
              :max="maxStandard"
              :step="stepStandard"
              :precision="precisionStandard"
              @blur="handleStandardBlur(length, 1)"
              @change="handleStandardChange(length, 1)"
              placeholder="max"
              autocomplete="off"
              v-model:value="length[1]"
              style="text-align: center; width: 60px; margin-right: 5px"
            />
            <span>
              {{ t('business.ontology.modal.constraints.unitStandard') }}
            </span>
          </div>
        </div>
        <!-- width -->
        <div class="wrapper-item">
          <span class="nowrap label-right">
            {{ t('business.ontology.modal.constraints.width') }}
          </span>
          <div class="nowrap input-space">
            <InputNumber
              :min="minStandard"
              :max="maxStandard"
              :step="stepStandard"
              :precision="precisionStandard"
              @blur="handleStandardBlur(width, 0)"
              @change="handleStandardChange(width, 0)"
              placeholder="min"
              autocomplete="off"
              v-model:value="width[0]"
              style="text-align: center; width: 60px; margin-right: 5px"
            />
            <span>
              {{ t('business.ontology.modal.constraints.unitStandard') }}
            </span>
          </div>
          <div class="nowrap">
            <InputNumber
              :min="minStandard"
              :max="maxStandard"
              :step="stepStandard"
              :precision="precisionStandard"
              @blur="handleStandardBlur(width, 1)"
              @change="handleStandardChange(width, 1)"
              placeholder="max"
              autocomplete="off"
              v-model:value="width[1]"
              style="text-align: center; width: 60px; margin-right: 5px"
            />
            <span>
              {{ t('business.ontology.modal.constraints.unitStandard') }}
            </span>
          </div>
        </div>
      </div>
      <div class="wrapper">
        <!-- height -->
        <div class="wrapper-item wrapper-left">
          <span class="nowrap label-left">
            {{ t('business.ontology.modal.constraints.height') }}
          </span>
          <div class="nowrap input-space">
            <InputNumber
              :min="minStandard"
              :max="maxStandard"
              :step="stepStandard"
              :precision="precisionStandard"
              @blur="handleStandardBlur(height, 0)"
              @change="handleStandardChange(height, 0)"
              placeholder="min"
              autocomplete="off"
              v-model:value="height[0]"
              style="text-align: center; width: 60px; margin-right: 5px"
            />
            <span>
              {{ t('business.ontology.modal.constraints.unitStandard') }}
            </span>
          </div>
          <div class="nowrap">
            <InputNumber
              :min="minStandard"
              :max="maxStandard"
              :step="stepStandard"
              :precision="precisionStandard"
              @blur="handleStandardBlur(height, 1)"
              @change="handleStandardChange(height, 1)"
              placeholder="max"
              autocomplete="off"
              v-model:value="height[1]"
              style="text-align: center; width: 60px; margin-right: 5px"
            />
            <span>
              {{ t('business.ontology.modal.constraints.unitStandard') }}
            </span>
          </div>
        </div>
        <!-- points -->
        <div class="wrapper-item">
          <span class="nowrap label-right">
            {{ t('business.ontology.modal.constraints.points') }}
          </span>
          <div class="nowrap">
            <InputNumber
              :min="minPoints"
              :max="maxPoints"
              :step="stepPoints"
              :precision="precisionPoints"
              autocomplete="off"
              v-model:value="points"
              style="text-align: center; width: 60px; margin-right: 19px"
            />
            <span></span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script lang="ts" setup>
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { InputNumber } from 'ant-design-vue';
  import { computed } from 'vue';

  const { t } = useI18n();
  const { createMessage } = useMessage();

  const props = defineProps<{
    isStandard: boolean;
    points: number;
    length: number | [number, number] | any;
    width: number | [number, number] | any;
    height: number | [number, number] | any;
  }>();

  const emits = defineEmits(['update:points', 'update:length', 'update:width', 'update:height']);
  const length = computed({
    get() {
      return props.length;
    },
    set(newVal) {
      emits('update:length', newVal);
    },
  });
  const width = computed({
    get() {
      return props.width;
    },
    set(newVal) {
      emits('update:width', newVal);
    },
  });
  const height = computed({
    get() {
      return props.height;
    },
    set(newVal) {
      emits('update:height', newVal);
    },
  });
  const points = computed({
    get() {
      return props.points;
    },
    set(newVal) {
      emits('update:points', newVal);
    },
  });

  const minStandard = 0;
  const maxStandard = 10000;
  const stepStandard = 0.1;
  const precisionStandard = 2;
  const minPoints = 0;
  const maxPoints = 2000000;
  const stepPoints = 1;
  const precisionPoints = 0;

  const handleStandardBlur = (target, flag) => {
    const left = target[0];
    const right = target[1];

    // hasValue?
    if (left == null || right == null) return;

    if (!flag) {
      // Leave the left box and judge to change the minimum value on the right
      if (right == minStandard) target[1] += 0.1;
      // Change the left value
      if (left >= right) {
        target[0] = right - 0.1;
        createMessage.error(t('business.ontology.modal.standardValidateMin'));
      }
    } else {
      // Leave the box on the right and judge to change the maximum value on the left
      if (left == maxStandard) target[0] -= 0.1;
      // Change the right value
      if (left >= right) {
        target[1] = left + 0.1;
        createMessage.error(t('business.ontology.modal.standardValidateMax'));
      }
    }
  };
  let timer;
  const handleStandardChange = (target, flag) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const left = target[0];
      const right = target[1];

      if (left == null || right == null) return;

      if (!flag) {
        if (right == minStandard) target[1] += 0.1;
        if (left >= right) {
          target[0] = right - 0.1;
          // createMessage.error(t('business.ontology.modal.standardValidateMin'));
        }
      } else {
        if (left == maxStandard) target[0] -= 0.1;
        if (left >= right) {
          target[1] = left + 0.1;
          // createMessage.error(t('business.ontology.modal.standardValidateMax'));
        }
      }
    }, 500);
  };
</script>
<style lang="less" scoped>
  .standard-container {
    padding-left: 10px;
    font-size: 14px;
    line-height: 16px;
    color: #333333;
    .wrapper {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      &-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: nowrap;
        margin-bottom: 10px;
        .nowrap {
          white-space: nowrap;
        }
        .label-left {
          margin-right: 45px;
        }
        .label-right {
          margin-right: 20px;
        }
        .input-space {
          margin-right: 15px;
        }
      }
      &-standard-left {
        margin-right: 133px;
      }
      &-left {
        margin-right: 40px;
      }
      &-input {
        white-space: nowrap;
      }
    }
  }
  :deep(.ant-input-number) {
    min-width: auto;
    border-radius: 4px;
  }
</style>
