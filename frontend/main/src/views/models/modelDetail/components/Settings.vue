<template>
  <div class="overview">
    <div class="des">
      <settingsPredict />
    </div>
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
  const [register, { openModal }] = useModal();
  const { t } = useI18n();

  const { createConfirm } = useMessage();
  let deleteModal = () => {
    createConfirm({
      iconType: 'warning',
      title: () => h('span', t('business.models.deleteModel.title')),
      content: () => h('span', t('business.models.settingsModel.deleteModalText')),
      okText: t('business.models.run.delete'),
      onOk: async () => {
        // await this.logout(true);
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
        white-space: pre-wrap;
        border: 1px solid red;
        border-radius: 10px;
        padding: 20px 15px;
        button {
          float: right;
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
