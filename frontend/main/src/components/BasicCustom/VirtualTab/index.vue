<template>
  <div :class="`${prefixCls}`">
    <div class="wrapper">
      <div
        v-for="item in list"
        :class="`item ${item.active ? 'active' : ''}`"
        :key="item.name"
        @click="
          () => {
            handleGo(item);
          }
        "
      >
        <img v-if="item.icon" :src="item.active ? item.activeIcon || item.icon : item.icon" />
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { defineProps } from 'vue';
  import { RouteEnum, RouteChildEnum } from '/@/enums/routeEnum';
  import { useGo } from '/@/hooks/web/usePage';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { parseParam } from '/@/utils/business/parseParams';
  const { prefixCls } = useDesign('virtualTab');

  const go = useGo();
  // const { t } = useI18n();
  const emits = defineEmits(['toggleTags']);

  type MenuItem = {
    name: string;
    url?: RouteEnum | RouteChildEnum;
    icon?: string;
    activeIcon?: string;
    active?: boolean;
    params?: any;
  };

  const handleGo = (item: MenuItem) => {
    if (props.type == 'PAGE') {
      if (!item?.active) go(parseParam(item.url as string, item.params));
    } else if (props.type == 'TAG') {
      emits('toggleTags', item.params);
    }
  };

  const props = withDefaults(
    defineProps<{
      list: MenuItem[];
      type?: string; // 'PAGE' | 'TAG'
    }>(),
    {
      type: 'PAGE',
    },
  );
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-virtualTab';
  @active-color: @primary-color;
  @active-bgColor: #f0f7ff;
  @active-startColor: #07b9ee;
  @active-endColor: #3cefba;
  .@{prefix-cls} {
    .wrapper {
      display: inline-block;
      border-radius: 26px;
      vertical-align: middle;
      margin: -1px;
      background-color: #fff;
      box-shadow: inset 0 0 0 1px #ccc;
      // border: 1px solid #ccc;
      // height: 38px;

      .item {
        display: inline-block;
        padding: 7px 10px;
        font-size: 18px;
        line-height: 21px;
        color: #ccc;
        cursor: pointer;

        &.active {
          border-radius: 26px;
          border: 1px solid @active-color;
          background-color: @active-bgColor;

          span {
            color: @active-color;
            // background: linear-gradient(135deg, @active-startColor, @active-endColor);
            // -webkit-text-fill-color: transparent;
            // background-clip: text;
          }
        }

        img {
          display: inline-block;
          width: 24px;
          height: 24px;
          margin-right: 2px;
        }

        span {
          vertical-align: middle;
          user-select: none;
        }
      }
    }
  }
</style>
