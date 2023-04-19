<template>
  <div :class="`${prefixCls}`">
    <div class="docs-wrapper">
      <img class="cursor-pointer" v-if="!type" :src="docs" @click="handleGoDocs" />
      <img class="cursor-pointer" v-else :src="docsMini" @click="handleGoDocs" />
    </div>
    <Divider />
    <Popover placement="rightBottom">
      <template #content>
        <p
          class="cursor-pointer p-3 m-0 hover:bg-blue-50"
          @click="
            () => {
              handleGo(RouteEnum.PROFILE);
            }
          "
        >
          <Icon style="color: #aaa" size="16" icon="ion:person-circle" />
          {{ t('routes.profile.profile') }}
        </p>
        <Divider style="margin: 0" />
        <p
          class="cursor-pointer p-3 m-0 hover:bg-blue-50"
          @click="
            () => {
              handleGo(RouteEnum.TEAM);
            }
          "
        >
          <Icon style="color: #aaa" size="16" icon="ion:person-circle" />
          My Team
        </p>
        <p
          class="cursor-pointer p-3 m-0 hover:bg-blue-50"
          @click="
            () => {
              handleGo(RouteEnum.Apis);
            }
          "
        >
          <Icon style="color: #aaa" size="16" icon="ion:person-circle" />
          My APIs
        </p>
        <Divider style="margin: 0" />
        <p class="cursor-pointer p-3 hover:bg-blue-50" @click="handleLoginOut">
          <Icon style="color: #aaa" icon="icomoon-free:exit" />
          {{ t('layout.header.dropdownItemLoginOut') }}
        </p>
      </template>
      <template #title>
        <div>
          <div class="text-center flex flex-col items-center">
            <!-- <img class="mb-2 mt-4 inline-block" width="36" :src="avatarUrl || ava" alt="" /> -->
            <ProfileAvatar
              class="mb-2 mt-4"
              :avatarUrl="avatarUrl"
              :nickname="nickname"
              :size="36"
            />
            <div class="w-60">{{ nickname }}</div>
            <!-- <div class="text-dark-50">{{ team?.name }}</div> -->
          </div>
        </div>
      </template>

      <div class="panel flex items-center">
        <!-- <img class="mr-2" width="36" :src="avatarUrl || ava" alt="" /> -->
        <ProfileAvatar class="mr-2" :avatarUrl="avatarUrl" :nickname="nickname" :size="31" />
        <div v-if="!type" class="panel-name">{{ nickname }}</div>
      </div>
    </Popover>
  </div>
</template>
<script lang="ts" setup>
  import { defineProps, onMounted, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  // import ava from '/@/assets/images/common/default-ava.png';
  import { useUserStore } from '/@/store/modules/user';
  import { useGo } from '/@/hooks/web/usePage';
  import { RouteEnum } from '/@/enums/routeEnum';
  import { Divider, Popover } from 'ant-design-vue';
  import { ProfileAvatar } from '/@@/ProfileAvatar';
  import Icon from '/@/components/Icon';
  import docs from '/@/assets/images/doc_bg.png';
  import docsMini from '/@/assets/images/doc_mini.png';

  const userStore = useUserStore();
  const { prefixCls } = useDesign('user-panel');
  const { t } = useI18n();
  // const user = userStore.getUserInfo || null;
  defineProps<{ type: boolean }>();
  function handleLoginOut() {
    userStore.confirmLoginOut();
  }

  const avatarUrl = computed(() => {
    return userStore.getUserInfo?.avatarUrl;
  });
  const nickname = computed(() => {
    return userStore.getUserInfo?.nickname;
  });

  onMounted(async () => {});

  const go = useGo();
  const handleGo = (route: RouteEnum) => {
    go(route);
  };

  const handleGoDocs = () => {
    window.open('https://docs.xtreme1.io/xtreme1-docs/');
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-user-panel';
  .@{prefix-cls} {
    width: calc(100% - 20px);
    color: #333;
    position: absolute;
    bottom: 10px;
    left: 10px;
    overflow: hidden;

    .team-action {
      flex: 1;
      margin-bottom: 24px;
      width: 100%;
      background: #e6f7fd;
      border-radius: 6px;
      box-sizing: border-box;
      font-size: 14px;
      text-align: center;
      cursor: pointer;
      line-height: 1;
      padding: 8px;
      color: #aaaaaa;

      .content-box {
        margin-top: 10px;

        .name {
          max-width: 119px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 15px;
          color: #666666;
        }
      }
    }
    .docs-wrapper {
      .normal {
        background: url(../../../assets/images/doc_bg.png);
        width: 160px;
        height: 60px;
      }
      .mini {
      }
    }
    .panel {
      width: 100%;

      .panel-name {
        flex: 1;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }

    :global(.ant-popover-inner-content) {
      padding: 0;
      margin-top: 10px;
    }

    :global(.ant-popover-placement-rightBottom > .ant-popover-content > .ant-popover-arrow) {
      display: none;
    }
  }
</style>
