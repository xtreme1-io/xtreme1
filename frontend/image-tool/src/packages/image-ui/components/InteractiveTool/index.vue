<template>
  <div class="interactive-tool">
    <span
      class="retry"
      @click="doIdentify()"
      v-show="iState.enable && iState.showBtn && !iState.loading"
      :style="{ left: iState.btnX + 'px', top: iState.btnY + 'px' }"
    >
      {{ t('image.Retry') }}
    </span>
    <IconLoading
      class="loading"
      v-show="iState.enable && iState.loading"
      :style="{ left: iState.loadingX + 'px', top: iState.loadingY + 'px' }"
    />
  </div>
</template>

<script setup lang="ts">
  import useInteractive from './useInteractive';
  import { t } from '@/lang';

  const { iState, doIdentify } = useInteractive();
</script>

<style lang="less" scoped>
  .interactive-tool {
    position: absolute;

    .loading {
      position: absolute;
      margin-top: -19px;
      margin-left: -19px;
      font-size: 38px;
      pointer-events: none;
    }

    .retry {
      display: inline-block;
      position: absolute;
      margin-top: -24px;
      border-radius: 4px;
      width: 110px;
      height: 22px;
      background: #3c9be8;
      color: white;
      line-height: 22px;
      cursor: pointer;
    }
  }
</style>
