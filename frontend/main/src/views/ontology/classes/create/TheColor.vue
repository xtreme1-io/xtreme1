<template>
  <div class="base-form-color">
    <div @click.prevent="showColor = !showColor">
      <Input
        autocomplete="off"
        style="background: white; color: #333; cursor: pointer"
        v-model:value="color"
      >
        <template #prefix>
          <span :style="{ background: props.color, width: '16px', height: '16px' }"> </span>
        </template>
        <template #suffix>
          <img :src="randomSvg" @click.stop="handleRandomColor" />
        </template>
      </Input>
    </div>
    <div v-if="showColor" class="color-options">
      <span
        v-for="item in colorOption"
        :key="item"
        :style="{ background: item }"
        :data-color="item"
        @click="handleGetColor(item)"
      ></span>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { Input } from 'ant-design-vue';
  import randomSvg from '/@/assets/svg/ontology/random.svg';
  import { colorOption } from '../attributes/data';

  const props = defineProps<{ color?: string }>();
  const emits = defineEmits(['update:color']);

  const color = computed({
    get() {
      return props.color;
    },
    set(newColor) {
      emits('update:color', newColor);
    },
  });

  const showColor = ref<boolean>(false);
  const handleGetColor = (newColor: string) => {
    color.value = newColor;
    showColor.value = false;
  };
  // get random color
  const handleRandomColor = () => {
    const num: number = Math.round(Math.random() * 8);
    color.value = colorOption.filter((item) => item != props.color)[num];
  };
</script>
<style lang="less" scoped>
  .base-form-color {
    position: relative;

    .color-options {
      position: absolute;
      left: -5px;
      top: 32px;
      z-index: 999;
      width: 156px;
      height: 66px;
      border-radius: 4px;
      background: #ffffff;
      box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.15);

      display: grid;
      grid-template-columns: repeat(5, 24px);
      grid-template-rows: repeat(2, 24px);
      gap: 6px;
      justify-content: center;
      align-content: center;

      span {
        width: 100%;
        height: 100%;
        cursor: pointer;

        &:hover {
          box-shadow: 0 0 0 2px #51bede;
        }
      }
    }
  }
</style>
