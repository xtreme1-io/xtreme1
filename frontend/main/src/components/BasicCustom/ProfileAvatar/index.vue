<template>
  <div class="avatar__container" :style="{ width: props.size + 'px', height: props.size + 'px' }">
    <img v-if="props.avatarUrl" :src="props.avatarUrl" />
    <span v-else :style="{ 'font-size': props.size / 2.8 + 'px' }">
      {{ props.nickname.substring(0, 2) }}
    </span>
  </div>
</template>
<script lang="ts" setup>
  const props = withDefaults(
    defineProps<{ avatarUrl?: string; nickname: string; size?: number }>(),
    {
      nickname: '',
      size: 160,
    },
  );
</script>
<style lang="less" scoped>
  .avatar__container {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: #d4e3fc;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
    }

    span {
      display: flex;
      justify-content: center;
      align-items: center;
      color: #60a9fe;
    }
  }
</style>
