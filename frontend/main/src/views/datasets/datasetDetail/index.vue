<template>
  <div :class="`${prefixCls}`">
    <div class="content">
      <div class="tools">
        <div class="backBtn" @click="handleBack">
          <Icon icon="ant-design:arrow-left-outlined" /><span class="btnText">Back</span>
        </div>
        <div class="actions"></div>
      </div>
      <div class="imgView">
        <img object-fit="contain" :src="imgUrl" alt="" />
      </div>
      <div class="scaleBox"></div>
    </div>
    <div class="sider">222</div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, onBeforeMount, computed } from 'vue';
  import { datasetDetailApi } from '/@/api/business/dataset';
  import { DatasetItem } from '/@/api/business/model/datasetModel';
  // import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  // import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  import Icon from '/@/components/Icon/index';
  import { useRoute } from 'vue-router';
  const { query } = useRoute();
  const { id } = query;

  const detail = ref<DatasetItem>({ files: [] });
  const imgUrl = computed(() => {
    const { files } = unref(detail);
    return files.length > 0 ? files[0]?.url?.largeUrl : '/@/assets/images/placeImg.png';
  });

  const { prefixCls } = useDesign('datasetDetail');
  // const { t } = useI18n();
  // const { setMenuSetting } = useMenuSetting();

  onBeforeMount(async () => {
    const res: DatasetItem = await datasetDetailApi({
      id: id as string,
    });
    detail.value = res;
  });

  // setMenuSetting({
  //   show: false,
  // });

  const handleBack = () => {
    window.history.back();
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-datasetDetail';
  .@{prefix-cls} {
    display: flex;
    background: white;

    .content {
      display: flex;
      flex: 1;
      padding: 20px;
      flex-direction: column;

      .tools {
        display: flex;

        .backBtn {
          padding: 6px 8px;
          color: #57ccef;
          margin-bottom: 20px;
          cursor: pointer;

          .btnText {
            margin-left: 10px;
            font-size: 16px;
            color: #666666;
          }
        }
      }

      .imgView {
        display: flex;
        flex: 1;
        width: 100%;
        align-items: center;
        justify-content: center;
        background: #f3f3f3;

        img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          // transform: scale(1.9);
          transform-origin: center;
        }
      }

      .scaleBox {
        height: 20px;
      }
    }

    .sider {
      height: calc(100vh - @header-height);
      background: yellow;
      width: 259px;
    }
  }
</style>
