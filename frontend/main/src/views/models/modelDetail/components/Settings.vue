<template>
  <div class="overview">
    <div class="des">
      <settingsPredict v-bind="$attrs" />
    </div>
  </div>

  <div class="overview">
    <div class="scenario">
      <div class="title">{{ t('business.models.settingsModel.DangerZone') }}</div>
      <div class="DangerZone">
        {{ t('business.models.settingsModel.DangerDes') }}
        <Button type="default" @click="deleteModal">{{
          t('business.models.settingsModel.DeleteModel')
        }}</Button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { deleteModelApi } from '/@/api/business/models';
  import { useModal } from '/@/components/Modal';
  import { Button } from 'ant-design-vue';
  import ClassModal from './ClassModal.vue';
  import { SvgIcon } from '/@/components/Icon';
  import { useI18n } from '/@/hooks/web/useI18n';
  import OverviewTags from './OverviewTags.vue';
  import OverviewClasses from './OverviewClasses.vue';
  import settingsPredict from './settingsPredict.vue';
  import { IOverview } from './typing';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { h } from 'vue';
  import { useRoute } from 'vue-router';
  import { useGo } from '/@/hooks/web/usePage';
  import { RouteEnum } from '/@/enums/routeEnum';
  const [register, { openModal }] = useModal();
  const { t } = useI18n();
  const route = useRoute();
  const modelId = Number(route?.query?.id);
  const { createConfirm } = useMessage();
  const go = useGo();

  const { createMessage } = useMessage();
  let deleteModal = () => {
    createConfirm({
      iconType: 'warning',
      title: () => h('span', t('business.models.deleteModel.title')),
      content: () => h('span', t('business.models.settingsModel.deleteModalText')),
      okText: t('business.models.run.delete'),
      onOk: async () => {
        await deleteModelApi(modelId);
        createMessage.success(t('action.deleteSuccess'));
        go(`${RouteEnum.MODELS}`);
      },
      okButtonProps: {
        style: { background: '#d27575', 'border-radius': '6px', padding: '10px 16px' },
      } as any,
    });
  };
</script>
<style lang="less" scoped>
  .overview {
    & > div {
      margin-right: 80px;
      margin-bottom: 30px;
      overflow: hidden;

      &:last-child {
        margin-bottom: 0;
      }

      .title {
        height: 25px;
        line-height: 25px;
        font-size: 18px;
        color: #000;
        margin-bottom: 20px;
      }
      .DangerZone {
        display: flex;
        justify-content: space-between;
        align-items: center;
        white-space: pre-wrap;
        border: 1px solid #aaa;
        border-radius: 10px;
        padding: 20px 15px;
        button {
          color: #f8827b !important;
          border: 1px solid #f8827b !important;
          border-radius: 8px;
        }
      }
    }

    .des_text {
      // font-size: 14px;
      // line-height: 32px;
      // color: #333;
      // word-break: break-word;

      // width: 90%;
      margin-left: 20px;
      margin-bottom: 10px;
      padding: 20px;
      padding-right: 50px;
      background: #fbe6fd;
      border-radius: 20px;
    }
  }
</style>
