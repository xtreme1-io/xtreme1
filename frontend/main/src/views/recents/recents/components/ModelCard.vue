<template>
  <div :class="`${prefixCls}-card-item model`">
    <div class="img-content">
      <div class="img"><img :src="place" alt="" /></div>
      <div class="content">
        <div class="title">title</div>
        <div class="text">2022-01-24</div>
        <div class="title">Model type</div>
        <div class="text">Xtreme1</div>
      </div>
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
