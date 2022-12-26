import { claimApi } from '/@/api/business/claim'; import { StageTypeEnum } from
'/@/api/business/model/taskModel';
<template>
  <div :class="`${prefixCls}`">
    <div class="card-content">
      <div class="main-title">{{ data.datasetName }}</div>
      <div class="sub-title">{{ data.name }}</div>
      <div class="img-content" v-if="data.datasetType === datasetTypeEnum.LIDAR_BASIC">
        <img :src="placeImg" alt="" />
      </div>
      <div class="img-content" v-else-if="data.datasetType === datasetTypeEnum.LIDAR_FUSION">
        <img :src="placeImg" alt="" style="height: 152px" />
        <div class="img" v-for="item in new Array(3)" :key="item" style="height: 100px">
          <img :src="placeImg" alt="" />
        </div>
      </div>
      <div class="img-content" v-else>
        <img :src="placeImg" alt="" style="height: 152px" />
        <div class="img" v-for="item in new Array(3)" :key="item" style="height: 100px">
          <img :src="placeImg" alt="" />
        </div>
      </div>
      <Dropdown :visible="dropdownVisible">
        <Button class="mt-1" block type="primary" @click="handleClaim">
          <span v-if="data.type === ActionTypeEnum.CLAIM">{{ t('routes.claim.claim') }}</span>
          <span v-else>{{ t('common.continueText') }}</span>
        </Button>
        <template #overlay v-if="buttonList.length > 1">
          <Menu>
            <MenuItem v-for="item in buttonList" :key="item.id" @click="handleGo(item.type)">
              <span class="flex items-center">
                <img :src="item.img" style="width: 20px; margin-right: 5px" />
                <span>{{ item.text }}</span>
              </span>
            </MenuItem>
          </Menu>
        </template>
      </Dropdown>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { Button } from '/@@/Button';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import placeImg from '/@/assets/images/placeImg.png';
  import { ref, defineProps } from 'vue';
  import { Dropdown, Menu } from 'ant-design-vue';
  import { claimListItem, ActionTypeEnum } from '/@/api/business/model/claimModel';
  import stageReviewImg from '/@/assets/images/task/stageReview.png';
  import stageAnnotationImg from '/@/assets/images/task/stageAnnotation.png';
  // import { useGo } from '/@/hooks/web/usePage';
  // import { RouteEnum } from '/@/enums/routeEnum';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import { StageTypeEnum } from '/@/api/business/model/taskModel';
  import { claimApi } from '/@/api/business/claim';
  const { t } = useI18n();
  const { prefixCls } = useDesign('card');
  const dropdownVisible = ref<boolean>(false);
  const MenuItem = Menu.Item;
  // const go = useGo();
  type Props = {
    data: claimListItem;
  };
  const props = defineProps<Props>();
  const handleGo = async (type) => {
    const res = await handleClaimApi({
      taskId: props.data.id,
      type: type,
    });
    console.log(res);
    handleGoTool(res);
    // if (window.location.hostname === 'localhost') {
    // }else{}
    // taskId,datasetId,batchId,stageId
    // go(`${RouteEnum.CLAIM}/detail?id=${id}`);
  };

  const handleGoTool = (data) => {
    if (document.domain !== 'localhost') {
      let origin = '';
      const list = window.location.hostname.split('.');
      if (list.length > 3) {
        origin = ['tool'].concat(list.slice(list.length - 3)).join('.');
      } else {
        origin = ['tool'].concat(list.slice(list.length - 2)).join('.');
      }
      // window.location.href = `${window.location.origin}?&batchId=${data.batchId}taskid=${props.data.id}&datasetId=${props.data.datasetId}&stageId=${data.stageId}`;
      window.location.href = `${window.location.protocol}//${origin}?&batchId=${data.batchId}&stageId=${data.stageId}`;
    }
  };

  const handleClaim = async () => {
    dropdownVisible.value = true;
    if (buttonList.length < 2) {
      const res = await handleClaimApi({
        taskId: props.data.id,
        type: buttonList[0].type,
      });
      handleGoTool(res);
    }
  };

  const handleClaimApi = async (params) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await claimApi(params);
        resolve(res);
      } catch (e) {
        // alert(e.message);
        reject(e);
      }
    });
  };
  let buttonList: any = [];
  if (
    props.data.stageTypeList &&
    props.data.stageTypeList.some((item) => item === StageTypeEnum.ANNOTATION)
  ) {
    buttonList.push({
      id: 1,
      type: StageTypeEnum.ANNOTATION,
      text: 'Annotate',
      img: stageAnnotationImg,
    });
  }
  if (
    props.data.stageTypeList &&
    props.data.stageTypeList.some((item) => item === StageTypeEnum.REVIEW)
  ) {
    buttonList.push({
      id: 2,
      type: StageTypeEnum.REVIEW,
      text: 'Review',
      img: stageReviewImg,
    });
  }
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-card';
  .@{prefix-cls}{
    position: relative;
    float: left;
    width: 20%;
    margin: 0 10px;
    margin-bottom: 20px;

    .card-content{
      padding: 10px;
      background: #fff;
      border: 1px solid #CCCCCC;
      border-radius: 12px;

      .main-title {
        font-size: 18px;
        margin-bottom: 8px;
        line-height: 21px;
        margin-left: 0.7%;
      }

      .items-center {
        font-size: 18px;
      }

      .sub-title {
        font-size: 18px;
        margin-bottom: 8px;
        line-height: 21px;
        margin-left: 0.7%;
      }

      .img-content{
        width: 100%;
        height: 252px;
        // margin: -4px;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;

        .img{
          flex-shrink: 0;
          width: 33.33%;
          height: 125px;
        }

        img{
          width: 100%;
          height: 100%;
          padding: 4px 4px;

        }
      }

      .text-content{
        margin: 4px 0;
        line-height: 21px;

        .name{
          font-size: 18px;
        }

        .field{
          font-size: 12px;
          color: #AAA;

          .data{
            color: #57CCEF;
          }
        }
      }
    }
  }
</style>
