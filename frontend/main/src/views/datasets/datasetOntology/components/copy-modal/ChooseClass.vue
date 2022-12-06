<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :okText="t('business.ontology.copy.next')"
    centered
    destroyOnClose
    @ok="handleConfirm"
    :okButtonProps="{ disabled: !isDisabled }"
    :width="1000"
    :height="700"
  >
    <template #title>
      <BackTitle :title="modalTitle" @back="handleBack" />
    </template>
    <div class="copy__modal" v-loading="loadingRef">
      <div class="flex items-center mb-15px justify-between">
        <VirtualTab :list="virtualTabList" type="TAG" @toggleTags="handleToggleTags" />
        <div class="ml-2">
          <Button type="primary" @click="handleCopyAll">
            <span>Copy Entire Ontology</span>
          </Button>
        </div>
      </div>
      <div class="flex mb-15px items-center justify-between">
        <ActionSelect
          :selectedList="
            currentVirtualTab === ClassTypeEnum.CLASS
              ? ClassSelectedList
              : ClassificationSelectedList
          "
          :actionList="actionList"
          :functionMap="functionMap"
        />
      </div>
      <div style="height: 450px">
        <ScrollContainer ref="scrollRef">
          <ClassCard
            :cardList="cardList"
            :selectedList="
              currentVirtualTab === ClassTypeEnum.CLASS
                ? ClassSelectedList
                : ClassificationSelectedList
            "
            :activeTab="currentVirtualTab"
            :cardType="CardTypeEnum.selector"
            @handleSelected="handleSelected"
          />
        </ScrollContainer>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, onMounted, ref, unref, watch } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';

  import { VirtualTab } from '/@@/VirtualTab';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Button } from '/@@/Button';
  import { ScrollActionType, ScrollContainer } from '/@/components/Container/index';
  import { handleScroll } from '/@/utils/business/scrollListener';
  import { ActionSelect } from '/@/components/BasicCustom/ActionSelect';
  import ClassCard from '/@/views/ontology/classes/components/ClassCard.vue';
  import { actionList, ICopyEnum } from './data';
  import BackTitle from './BackTitle.vue';

  import { CardTypeEnum } from '/@/views/ontology/classes/attributes/data';
  import { getOntologyClassesParams, ClassTypeEnum } from '/@/api/business/model/classesModel';
  import { getOntologyClassApi, getOntologyClassificationApi } from '/@/api/business/classes';

  const { createMessage } = useMessage();
  const { t } = useI18n();

  const emits = defineEmits(['copyAll', 'back', 'next']);

  const ontologyId = ref<string>();

  /** Modal */
  const [registerModal, { closeModal }] = useModalInner((params) => {
    ontologyId.value = params.ontologyId;
    getList();
  });
  const modalTitle = ref<string>('Copy from Ontology Center');
  const isDisabled = ref<boolean>(true);
  const handleConfirm = () => {
    closeModal();
    setTimeout(() => {
      emits('next', {
        ClassSelectedList: ClassSelectedList.value,
        ClassificationSelectedList: ClassificationSelectedList.value,
      });
      isDisabled.value = true;
    }, 100);
  };
  const handleBack = () => {
    closeModal();
    setTimeout(() => {
      emits('back', ICopyEnum.ONTOLOGY);
      currentVirtualTab.value = ClassTypeEnum.CLASS;
      ClassSelectedList.value = [];
      ClassificationSelectedList.value = [];
    }, 100);
  };

  /** Copy All */
  const handleCopyAll = () => {
    emits('copyAll', ICopyEnum.CLASSES);
  };

  /** Virtual */
  const currentVirtualTab = ref<ClassTypeEnum>(ClassTypeEnum.CLASS);
  const virtualTabList = computed(() => {
    return [
      {
        name: 'Class',
        active: currentVirtualTab.value == ClassTypeEnum.CLASS,
        params: { tab: ClassTypeEnum.CLASS },
      },
      {
        name: 'Classification',
        active: currentVirtualTab.value == ClassTypeEnum.CLASSIFICATION,
        params: { tab: ClassTypeEnum.CLASSIFICATION },
      },
    ];
  });
  const handleToggleTags = (item) => {
    currentVirtualTab.value = item.tab;
    getList();
  };

  /** Action */
  const functionMap = {
    handleSelectAll: () => {
      if (currentVirtualTab.value === ClassTypeEnum.CLASS) {
        ClassSelectedList.value = cardList.value.map((item: any) => item.id);
      } else {
        ClassificationSelectedList.value = cardList.value.map((item: any) => item.id);
      }
    },
    handleUnselectAll: () => {
      if (currentVirtualTab.value === ClassTypeEnum.CLASS) {
        ClassSelectedList.value = [];
      } else {
        ClassificationSelectedList.value = [];
      }
    },
  };

  /** Select */
  const ClassSelectedList = ref<number[]>([]);
  const ClassificationSelectedList = ref<number[]>([]);
  const handleSelected = (flag: boolean, id: number, type) => {
    console.log(flag, id);

    if (type === ClassTypeEnum.CLASS) {
      const index = unref(ClassSelectedList).findIndex((item: number) => id === item);

      if (index === -1 && flag) {
        unref(ClassSelectedList).push(id);
      }

      if (index > -1 && !flag) {
        unref(ClassSelectedList).splice(index, 1);
      }
    } else {
      const index = unref(ClassificationSelectedList).findIndex((item: number) => id === item);

      if (index === -1 && flag) {
        unref(ClassificationSelectedList).push(id);
      }

      if (index > -1 && !flag) {
        unref(ClassificationSelectedList).splice(index, 1);
      }
    }
  };
  watch([ClassSelectedList, ClassificationSelectedList], () => {
    if (ClassSelectedList.value.length > 0 || ClassificationSelectedList.value.length > 0) {
      isDisabled.value = false;
    }
  });

  /** List */
  const pageNo = ref();
  const total = ref();
  const cardList = ref([]);
  const loadingRef = ref<boolean>(false);
  const getList = async (isConcat = false) => {
    loadingRef.value = true;

    if (!isConcat) {
      pageNo.value = 1;
      cardList.value = [];
    }

    const postData: getOntologyClassesParams = {
      pageNo: pageNo.value,
      pageSize: 30,
      ontologyId: Number(ontologyId.value),
    };

    let res;
    try {
      if (currentVirtualTab.value == ClassTypeEnum.CLASS) {
        res = await getOntologyClassApi(postData);
      } else {
        res = await getOntologyClassificationApi(postData);
      }

      cardList.value = cardList.value.concat(res.list);

      total.value = res.total;
    } catch (error: any) {
      createMessage.error(String(error));
      cardList.value = [];
      total.value = 0;
    }
    loadingRef.value = false;
  };

  /** Scroll */
  const scrollRef = ref<Nullable<ScrollActionType>>(null);
  onMounted(() => {
    handleScroll(scrollRef, () => {
      if (total.value > cardList.value.length) {
        pageNo.value++;
        getList(true);
      }
    });
  });
</script>
<style lang="less" scoped>
  @import './index.less';
</style>
