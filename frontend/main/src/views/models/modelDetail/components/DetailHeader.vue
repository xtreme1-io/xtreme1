<template>
  <div class="header">
    <div class="header__back" @click="goBack">
      <img src="../../../../assets/images/models/back.svg" alt="" />
      <span>{{ t('common.back') }}</span>
    </div>
    <div class="flex h-106px">
      <div class="header__image">
        <template v-if="hasType">
          <img v-if="isImage" src="../../../../assets/images/models/overviewImage.png" />
          <img v-else src="../../../../assets/images/models/overviewLidar.svg" />
        </template>
      </div>
      <div class="header__content">
        <div>
          <div class="type">
            <template v-if="hasType">
              <!-- <span v-if="isImage" class="image">{{ props.headerData.type }} </span>
              <span v-else class="lidar">{{ props.headerData.type }} </span> -->
              <span v-if="isImage" class="image">{{ t('business.dataset.image') }} </span>
              <span v-else class="lidar">
                {{ t('business.ontology.modal.datasetType.lidar') }}
              </span>
            </template>
          </div>
          <div class="title">
            <template v-if="!isEdit">
              {{ showHeaderDataName || '' }}
              <SvgIcon
                style="color: #c4c4c4; cursor: pointer; border-radius: 6px; border: 2px solid #aaa"
                size="24"
                @click="handleEdit"
                name="edit"
              />
            </template>
            <template v-else>
              <Input style="margin-right: 20px" v-model:value="headerDataName" />
              <Button type="default" @click="handleCancel">{{ t('common.cancelText') }}</Button>
              <Button type="primary" class="ml-2" @click="handleSave">{{
                t('common.saveText')
              }}</Button>
            </template>
          </div>
        </div>
        <div>
          <span>{{ t('business.models.detail.usage') + '：' }}</span>
          <div>
            <Progress
              style="width: 200px"
              :percent="headerData.quotaProgress"
              :strokeWidth="12"
              strokeColor="#57CCEF"
              trailColor="#aaa"
              :format="() => headerData.quotaText"
            />
          </div>
        </div>
        <div>
          <span>{{ t('business.models.detail.creator') + '：' }}</span>
          <span>{{ props.headerData.creator }}</span>
        </div>
        <div>
          <span>{{ t('business.models.detail.createTime') + '：' }}</span>
          <span>{{ getDate(props.headerData.createTime) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { SvgIcon } from '/@/components/Icon';
  import { computed, ref, watch } from 'vue';
  import { useGo } from '/@/hooks/web/usePage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getDate } from '/@/utils/business/timeFormater';
  import { RouteEnum } from '/@/enums/routeEnum';
  import { IHeader } from './typing';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import { Progress, Button, Input, message } from 'ant-design-vue';
  import { editModelApi } from '/@/api/business/models';
  import { useRoute } from 'vue-router';
  import { number } from 'vue-types';

  const { t } = useI18n();
  const isEdit = ref(false);
  const props = withDefaults(defineProps<{ headerData: IHeader }>(), {
    headerData: (): IHeader => {
      return {
        type: '',
        name: '',
        creator: '',
        createTime: new Date(),
        quotaProgress: 0,
        quotaText: '',
      };
    },
  });

  const hasType = computed(() => {
    return !!props.headerData.type;
  });

  const isImage = computed(() => {
    return props.headerData.type == datasetTypeEnum.IMAGE;
  });

  let headerDataName = ref<string>('');
  let showHeaderDataName = ref<string>('');
  watch(
    () => props.headerData.name,
    (val) => {
      headerDataName.value = val;
      showHeaderDataName.value = val;
    },
  );

  // let headerDataName = computed({
  //   get() {
  //     return props.headerData.name;
  //   },
  //   set(value) {
  //     console.log(value);
  //     // emits('update:name', value);
  //   },
  // });
  const go = useGo();
  const goBack = () => {
    go(`${RouteEnum.MODELS}`);
  };
  const handleEdit = () => {
    isEdit.value = true;
  };
  const handleCancel = () => {
    isEdit.value = !isEdit.value;
  };
  const route = useRoute();
  const modelId = String(route?.query?.id);
  const handleSave = async () => {
    const params = {
      id: Number(modelId),
      name: headerDataName.value,
    };
    await editModelApi(params);
    isEdit.value = false;
    showHeaderDataName.value = headerDataName.value;
    message.success('Successed');
    // handleSuccess();
  };
</script>
<style lang="less" scoped>
  .header {
    display: flex;
    flex-direction: column;
    margin: 20px;
    height: 150px;

    &__back {
      width: 70px;
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      cursor: pointer;

      img {
        margin: 5px;
      }

      span {
        font-size: 18px;
        line-height: 21px;
        color: #57ccef;
        margin-left: 4px;
      }
    }

    &__image {
      width: 108px;
      height: 90px;

      img {
        width: 100%;
        height: 100%;
      }
    }

    &__content {
      margin-left: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;

      & > div {
        display: flex;
        align-items: center;
        font-size: 14px;
        line-height: 16px;
        color: #333;

        .type {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          height: 20px;

          span {
            padding: 2px 8px;
            font-size: 12px;
            color: #fff;
            border-radius: 4px;
            margin-right: 10px;
          }

          .image {
            background: #fcb17a;
          }

          .lidar {
            background: #86affe;
          }
        }

        .title {
          font-weight: 500; //font-weight: 600;

          font-size: 20px;
          line-height: 23px;
          height: 23px;
          color: #333333;
          white-space: nowrap;
        }
      }
    }
  }
</style>
