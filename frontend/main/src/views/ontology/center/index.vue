<template>
  <div :class="`${prefixCls}`" v-loading="loadingRef">
    <!-- Search -->
    <div class="flex justify-end h-66px py-15px px-20px">
      <Input
        autocomplete="off"
        style="width: 240px"
        size="large"
        v-model:value="searchValue"
        :placeholder="t('common.searchText')"
      >
        <template #suffix>
          <Icon icon="ant-design:search-outlined" style="color: #aaa" size="16" />
        </template>
      </Input>
    </div>
    <!-- CardList -->
    <div style="height: calc(100vh - 184px)">
      <ScrollContainer ref="scrollRef">
        <OntologyCard :cardList="cardList" @create="handleCreate" />
      </ScrollContainer>
    </div>

    <!-- Modal -->
    <CreateModal @register="register" @success="handleRefresh" />
  </div>
</template>
<script lang="ts" setup>
  import { watch, ref, onMounted, provide } from 'vue';
  // 工具
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useI18n } from '/@/hooks/web/useI18n';
  // 组件
  import { Input } from 'ant-design-vue';
  import Icon from '/@/components/Icon';
  import OntologyCard from './components/OntologyCard.vue';
  import { useModal } from '/@/components/Modal';
  import CreateModal from './components/CreateModal.vue';
  import { ScrollContainer, ScrollActionType } from '/@/components/Container/index';
  import { handleScroll } from '/@/utils/business/scrollListener';
  // 接口
  import { getOntologyApi } from '/@/api/business/ontology';
  import { OntologyListItem } from '/@/api/business/model/ontologyModel';

  const { prefixCls } = useDesign('ontologyCenter');
  const { t } = useI18n();
  const loadingRef = ref<boolean>(false);
  let cardList = ref<OntologyListItem[]>([]);
  const total = ref<number>(0);
  const pageNo = ref<number>(1);

  const scrollRef = ref<Nullable<ScrollActionType>>(null);
  onMounted(() => {
    handleScroll(scrollRef, () => {
      if (total.value > cardList.value.length) {
        pageNo.value++;
        getOntologyList(true);
      }
    });
    getOntologyList();
  });

  // 获取列表
  const getOntologyList = async (isConcat = false) => {
    loadingRef.value = true;

    if (!isConcat) {
      pageNo.value = 1;
      cardList.value = [];
    }
    try {
      const res = await getOntologyApi({
        pageNo: pageNo.value,
        pageSize: 30,
        name: searchValue.value,
      });
      cardList.value = cardList.value.concat(res.list);
      total.value = res.total;
    } catch (error: any) {
      cardList.value = [];
      total.value = 0;
      // createMessage.error(String(error));g
    }
    loadingRef.value = false;
  };

  // 搜索事件
  const searchValue = ref('');
  let timeout;
  watch(searchValue, () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      getOntologyList();
    }, 400);
  });
  // 刷新列表
  const handleRefresh = () => {
    searchValue.value = '';
    getOntologyList();
  };
  provide('handleRefresh', handleRefresh);

  // 新增事件
  const [register, { openModal }] = useModal();
  const handleCreate = () => {
    openModal(true, {});
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-ontologyCenter';
  .@{prefix-cls} {
    position: relative;
    padding: 0;
    height: 100%;
  }
</style>
