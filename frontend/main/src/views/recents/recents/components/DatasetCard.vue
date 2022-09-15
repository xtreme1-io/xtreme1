<template>
  <div :class="`${prefixCls}-card-item dataset`">
    <div class="img-content">
      <div class="img"><img :src="place" alt="" /></div>
      <div class="img"><img :src="place" alt="" /></div>
      <div class="img"><img :src="place" alt="" /></div>
      <div class="img"><img :src="place" alt="" /></div>
      <div class="img"><img :src="place" alt="" /></div>
      <div class="img"><img :src="place" alt="" /></div>
    </div>
    <div class="name">Architecture</div>
  </div>
</template>
<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import place from '/@/assets/images/placeImg.png';
  const { prefixCls } = useDesign('recents');
</script>
<style lang="less" scoped>
  @import '../index.less';
</style>
