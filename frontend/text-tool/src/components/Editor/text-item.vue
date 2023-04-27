<template>
  <div class="flex" v-if="item?.role === 'prompter'">
    <div class="user"> A </div>
    <div class="prompter">
      <div>
        {{ item?.text }}
      </div>
      <div class="thumbs">
        <SvgIcon
          @click="item.direction = ''"
          v-if="item.direction === 'up'"
          name="had-thumbs-up"
        />
        <SvgIcon @click="item.direction = 'up'" v-else name="thumbs-up" />

        <SvgIcon
          @click="item.direction = ''"
          v-if="item.direction === 'down'"
          name="had-thumbs-down"
        />
        <SvgIcon @click="item.direction = 'down'" v-else name="thumbs-down" />
      </div>
    </div>
  </div>
  <div style="justify-content: end" class="flex" v-if="item?.role === 'assistant'">
    <div class="assistant">
      <div>
        {{ item?.text }}
      </div>

      <div class="thumbs">
        <SvgIcon
          @click="item.direction = ''"
          v-if="item.direction === 'up'"
          name="had-thumbs-up"
        />
        <SvgIcon @click="item.direction = 'up'" v-else name="thumbs-up" />

        <SvgIcon
          @click="item.direction = ''"
          v-if="item.direction === 'down'"
          name="had-thumbs-down"
        />
        <SvgIcon @click="item.direction = 'down'" v-else name="thumbs-down" />
      </div>
    </div>
    <div class="user"> B </div>
  </div>
</template>

<script setup lang="ts">
  import { ITextItem } from 'pc-editor';

  interface IProps {
    item: ITextItem
  }

  const props = defineProps<IProps>();
  function onDirection(type: 'up' | 'down') {}
</script>

<style lang="less" scoped></style>
