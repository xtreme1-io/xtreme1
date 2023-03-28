<template>
  <div :class="`${prefixCls}`" v-loading="loadingRef">
    <div class="actions">
      <VirtualTab :list="tagList" :type="virtualTabEnum.TAG" @toggleTags="handleToggleTags" />
      <div class="btn">
        <Button type="primary" @click="handleCreate">
          {{ t('business.models.create.createModels') }}
        </Button>
      </div>
    </div>
    <ScrollContainer ref="scrollRef" style="height: calc(100vh - 154px)">
      <ModelsCard :list="list" />
    </ScrollContainer>

    <!-- 弹窗 -->
    <CreateModal ref="CreateModalRef" @register="register" @success="handleRefresh" />
  </div>
</template>
<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  // 组件
  import { Button } from '/@@/Button';
  import { VirtualTab, virtualTabEnum } from '/@@/VirtualTab';
  import { useModal } from '/@/components/Modal';
  import { ScrollContainer, ScrollActionType } from '/@/components/Container/index';
  import { handleScroll } from '/@/utils/business/scrollListener';
  import ModelsCard from './components/ModelsCard.vue';
  import CreateModal from './components/CreateModal.vue';
  // 接口
  import { getModelPageApi } from '/@/api/business/models';
  import { ResponseModelParams, ModelListItem } from '/@/api/business/model/modelsModel';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  // 图片
  import All from '/@/assets/svg/tags/all.svg';
  import AllActive from '/@/assets/svg/tags/allActive.svg';
  import Lidar from '/@/assets/svg/tags/lidar.svg';
  import LidarActive from '/@/assets/svg/tags/lidarActive.svg';
  import Image from '/@/assets/svg/tags/image.svg';
  import ImageActive from '/@/assets/svg/tags/imageActive.svg';
  import { BuriedPointEnum } from '/@/enums/buriedPointEnum';
  import { buriedPoint } from '/@/utils/business/buriedPoint';

  const { prefixCls } = useDesign('modelsList');
  const { t } = useI18n();
  const { createMessage } = useMessage();
  const currentType = ref<datasetTypeEnum | undefined>();

  // 页签数组
  const tagList = computed(() => {
    return [
      {
        name: t('business.models.list.all'),
        active: !currentType.value,
        params: { datasetType: null },
        icon: All,
        activeIcon: AllActive,
      },
      {
        name: t('business.models.list.lidar'),
        active: currentType.value == datasetTypeEnum.LIDAR,
        params: { datasetType: datasetTypeEnum.LIDAR },
        icon: Lidar,
        activeIcon: LidarActive,
      },
      {
        name: t('business.models.list.image'),
        active: currentType.value == datasetTypeEnum.IMAGE,
        params: { datasetType: datasetTypeEnum.IMAGE },
        icon: Image,
        activeIcon: ImageActive,
      },
    ];
  });
  const handleToggleTags = (item) => {
    currentType.value = item.datasetType;
    getList();
  };

  const list = ref<ModelListItem[]>([]);
  const total = ref<number>(0);
  const pageNo = ref<number>(1);
  const loadingRef = ref<boolean>(false);
  const scrollRef = ref<Nullable<ScrollActionType>>(null);

  const getList = async (isConcat = false) => {
    loadingRef.value = true;

    if (!isConcat) {
      pageNo.value = 1;
      list.value = [];
    }
    try {
      const params = { datasetType: currentType.value };
      const res: ResponseModelParams = await getModelPageApi({
        pageNo: pageNo.value,
        pageSize: 12,
        ...params,
      });
      // NOTE 后台未返回分页结构，暂时这样处理，判断为数组
      if (Array.isArray(res)) {
        list.value = res;
      } else {
        list.value = list.value.concat(res.list);
      }
      total.value = res.total;
    } catch (error: any) {
      list.value = [];
      total.value = 0;
      createMessage.error(String(error));
    }
    loadingRef.value = false;
  };
  // 页面加载
  let CreateModalRef = ref();
  onMounted(() => {
    handleScroll(scrollRef, () => {
      if (total.value > list.value.length) {
        pageNo.value++;
        getList(true);
      }
    });
    getList();

    setTimeout(() => {
      if (window.opener && window.opener.reConnect) {
        let { datasetType } = window.opener?.reConnect;
        handleCreate();
        datasetType = datasetType.includes('LIDAR') ? datasetTypeEnum.LIDAR : datasetTypeEnum.IMAGE;
        setTimeout(() => {
          CreateModalRef.value.setFieldsValue({ datasetType: datasetType });
        });
      }
    }, 500);
  });
  // 新增事件
  const [register, { openModal }] = useModal();
  const handleCreate = () => {
    openModal();
  };
  // 刷新列表
  const handleRefresh = () => {
    getList();
    setTimeout(() => {
      if (window.opener && window.opener.reConnect) {
        window.opener = null;
      }
    }, 500);
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-modelsList';
  .@{prefix-cls} {
    // position: relative;
    height: 100%;
    padding: 20px 20px 0;

    .actions {
      position: relative;
      margin-bottom: 20px;
      height: 36px;

      .btn {
        position: absolute;
        top: 0;
        right: 0;
      }
    }

    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;

      .title {
        font-size: 24px;
        line-height: 28px;
        color: #666;
      }
    }
  }
</style>
