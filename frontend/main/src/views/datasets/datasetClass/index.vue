<template>
  <div :class="`${prefixCls}`" v-loading="loadingRef">
    <FormDrawer @register="register" @fetchList="fetchList" :detail="detail" />
    <!-- <FormModal @register="register1" /> -->
    <div class="tools">
      <div class="searchBox">
        <Input.Search placeholder="input to search" v-model:value="name" @input="fetchList" />
      </div>
      <div class="actions">
        <Dropdown placement="bottomRight">
          <Button class="mr-2">
            <span class="text-primary">
              <Icon icon="mdi:filter" size="16" />
            </span>
            {{ t('common.filterText') }}
          </Button>
          <template #overlay>
            <Menu>
              <Menu.Item
                @click="
                  () => {
                    handleClearFilter();
                  }
                "
              >
                <div class="item">
                  <img
                    :src="allImg"
                    style="width: 16px; height: 16px; margin-right: 10px; margin-left: 2px"
                  />
                  <span>{{ t('common.allText') }} </span>
                </div>
              </Menu.Item>
              <Menu.Item
                v-for="item in list"
                :key="item.id"
                @click="
                  () => {
                    handleChange(item.type);
                  }
                "
              >
                <div class="item">
                  <img :src="item.img" />
                  <span>{{ item.text }} </span>
                </div>
              </Menu.Item>
              <Menu.Item
                @click="
                  () => {
                    handleChangeType(ClassTypeEnum.CLASSIFICATION);
                  }
                "
              >
                <div class="item">
                  <img
                    :src="tag"
                    style="width: 16px; height: 16px; margin-right: 10px; margin-left: 2px"
                  />
                  <span>{{ t('business.class.classification') }} </span>
                </div>
              </Menu.Item>
            </Menu>
          </template>
        </Dropdown>
        <Button type="primary" @click="handleOpenForm">
          <span>
            <Icon icon="ic:baseline-add" size="16" />
          </span>
          {{ t('common.createText') }}
        </Button>
      </div>
    </div>
    <div class="list" v-if="listRef.length > 0">
      <Card
        v-for="item in listRef"
        :key="item.id"
        :record="item"
        @fetchList="fetchList"
        @handleDetail="handleDetail"
      />
    </div>
    <div class="empty" v-else>
      <div class="empty-wrapper">
        <img src="../../../assets/images/class/empty-place.png" alt="" />
        <div class="tip">{{ t('business.class.classEmptyTip') }}</div>
        <Button :size="ButtonSize.LG" gradient @click="handleOpenForm">
          {{ t('business.class.createClass') }}
        </Button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  // import FormModal from './test/FormModal.vue';
  // import { useModal } from '/@/components/Modal';

  import { onBeforeMount, ref, computed, provide } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Dropdown, Menu } from 'ant-design-vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import FormDrawer from './components/FormDrawer.vue';
  import Icon from '/@/components/Icon';
  import { useDrawer } from '/@/components/Drawer';
  import { Button, ButtonSize } from '/@@/Button';
  import { Input } from 'ant-design-vue';
  import Card from './components/ClassCard.vue';
  import { toolTypeList, toolTypeList3D } from './components/formSchemas';
  import { classListApi, getDetailApi } from '/@/api/business/class';
  import { useRoute } from 'vue-router';
  import { ClassItem, ClassTypeEnum, ToolTypeEnum } from '/@/api/business/model/classModel';
  import allImg from '/@/assets/images/class/Vector.png';
  import tag from '/@/assets/images/class/tag.png';
  import { datasetItemDetail } from '/@/api/business/dataset';
  import { DatasetListItem, datasetTypeEnum } from '/@/api/business/model/datasetModel';
  const { query } = useRoute();
  const { id } = query;
  const { prefixCls } = useDesign('datasetClass');
  const [register, { openDrawer }] = useDrawer();

  // const [register1, { openModal, closeModal }] = useModal();

  // defineExpose({ openModal: openModal.bind(null, true), closeModal });

  const { t } = useI18n();

  const info = ref<DatasetListItem>();
  const loadingRef = ref<boolean>(false);
  const name = ref('');
  const type = ref<ClassTypeEnum | undefined>();
  const listRef = ref<ClassItem[]>([]);
  const filterType = ref<ToolTypeEnum | undefined>();
  const detail = ref<Nullable<ClassItem>>(null);

  const list = computed(() => {
    if (isImg.value) {
      return toolTypeList;
    }
    return toolTypeList3D;
  });

  const isImg = computed(() => {
    return info?.value?.type === datasetTypeEnum.IMAGE;
  });

  onBeforeMount(async () => {
    if (false) {
      fetchList();
      fetchDatasetInfo();
    }
  });

  const fetchList = async () => {
    loadingRef.value = true;
    const res = await classListApi({
      pageNo: 1,
      pageSize: 9999,
      datasetId: id as string,
      name: name.value,
      toolType: filterType.value,
      type: type.value,
    });
    listRef.value = res.list;
    loadingRef.value = false;
  };

  provide('datasetItem', info);

  const fetchDatasetInfo = async () => {
    info.value = await datasetItemDetail({ id: id as string });
  };

  const handleOpenForm = () => {
    detail.value = null;
    openDrawer();
    // openModal();
  };

  const handleDetail = async (id) => {
    loadingRef.value = true;
    detail.value = await getDetailApi({ id });
    loadingRef.value = false;
    openDrawer();
  };

  const handleChange = (val) => {
    filterType.value = val;
    type.value = undefined;
    fetchList();
  };

  const handleClearFilter = () => {
    filterType.value = undefined;
    type.value = undefined;
    fetchList();
  };

  const handleChangeType = (val: ClassTypeEnum) => {
    type.value = val;
    filterType.value = undefined;
    fetchList();
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-datasetClass';
  .@{prefix-cls} {
    display: flex;
    flex-direction: column;
    padding: 10px 20px 0;
    color: #333;
    flex: 1;
    background: linear-gradient(
      180deg,
      rgba(87, 204, 239, 0.12) 0%,
      rgba(134, 229, 201, 0.12) 100%
    );

    .item {
      display: flex;
      align-items: center;
    }

    .item img {
      width: 20px;
      height: 20px;
      margin-right: 8px;
    }

    :global(.ant-dropdown-menu-item) {
      width: 200px;
    }

    .empty {
      width: 282px;
      margin: 210px auto 0;
      text-align: center;

      .tip {
        margin-top: 15px;
        margin-bottom: 15px;
        color: @primary-color;
      }
    }

    .tools {
      display: flex;
      margin-bottom: 9px;
      justify-content: space-between;

      .searchBox {
        width: 240px;
      }
    }

    .list {
      margin: 0 -5px;
      overflow: hidden;
      flex: 1;
    }
  }
</style>
