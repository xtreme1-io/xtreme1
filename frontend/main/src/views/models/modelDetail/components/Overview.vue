<template>
  <div class="overview des">
    <OverviewDes :description="props.overviewData.description" />
  </div>
  <!-- <div class="scenario">
      <div class="title">{{ t('business.models.overviewPage.scenarios') }}</div>
      <OverviewTags :tagList="props.overviewData.scenario" />
    </div> -->

  <div class="classes overview">
    <div class="title"
      >{{ t('business.models.overviewPage.classes') }}
      <div style="float: right"
        ><SvgIcon
          style="
            color: #c4c4c4;
            cursor: pointer;
            vertical-align: revert;
            border-radius: 6px;
            border: 2px solid #aaa;
            padding: 4px;
          "
          size="28"
          @click="openModal"
          name="setting"
        />
      </div>
    </div>

    <OverviewClasses
      v-if="props.overviewData.classes.length > 0"
      :isGroup="props.overviewData.isType"
      :classes="props.overviewData.classes"
      :datasetType="props.datasetType"
    />

    <Empty v-else />
  </div>

  <ClassModal :classes="props.overviewData.classes" @register="register" />
</template>
<script lang="ts" setup>
  import { useRoute } from 'vue-router';
  import { Empty } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import ClassModal from './ClassModal.vue';
  import { SvgIcon } from '/@/components/Icon';
  import { useI18n } from '/@/hooks/web/useI18n';
  import OverviewTags from './OverviewTags.vue';
  import OverviewClasses from './OverviewClasses.vue';
  import OverviewDes from './OverviewDes.vue';
  import { IOverview } from './typing';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  const [register, { openModal }] = useModal();
  const { t } = useI18n();
  const props = withDefaults(
    defineProps<{ overviewData: IOverview; datasetType: datasetTypeEnum }>(),
    {
      overviewData: (): IOverview => {
        return {
          isType: false,
          description: '',
          scenario: '',
          classes: [],
        };
      },
    },
  );
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
      background: #e6f7fd;
      border-radius: 20px;
    }
  }
</style>
