<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    centered
    destroyOnClose
    @cancel="handleCancel"
    @ok="handleConfirm"
    :okText="t('business.ontology.copy.next')"
    :okButtonProps="{ disabled: isDisabled }"
    :width="1000"
    :height="700"
  >
    <template #title>
      <BackTitle :title="modalTitle" @back="handleBack" />
    </template>
    <div class="copy__modal">
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
      <div class="wrapper-outer">
        <div
          class="wrapper-inner"
          v-show="cardList.length > 0"
          style="height: 450px; padding: 15px"
        >
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
              :canCreate="false"
              :hasBorder="true"
              @handleSelected="handleSelected"
            />
          </ScrollContainer>
        </div>
        <div class="wrapper-inner empty" v-if="cardList.length == 0">
          <div class="empty-wrapper">
            <img src="../../../../../assets/images/class/empty-place.png" alt="" />
            <div class="tip">
              There is ontology of this Dataset type available. You can go to
              <span class="high_light" @click="handleToOntology"> Ontology Center</span>
              to create a new one.
            </div>
          </div>
        </div>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, onMounted, ref, unref, watch } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useGo } from '/@/hooks/web/usePage';
  import { RouteEnum } from '/@/enums/routeEnum';
  import emitter from 'tiny-emitter/instance';

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
  const go = useGo();

  const emits = defineEmits(['copyAll', 'back', 'next']);

  const ontologyId = ref<string>();
  watch(ontologyId, () => {
    ClassSelectedList.value = [];
    ClassificationSelectedList.value = [];
  });

  /** Modal */
  const modalTitle = ref<string>('Copy from Ontology Center');
  const [registerModal, { changeLoading }] = useModalInner((params) => {
    changeLoading(false);
    ontologyId.value = params.ontologyId;

    // title
    const ontologyName = params.ontologyName ?? 'Ontology Center';
    modalTitle.value = `Copy from ${ontologyName}`;

    getList();
  });

  const handleConfirm = () => {
    changeLoading(true);
    setTimeout(() => {
      emits('next', {
        ClassSelectedList: unref(ClassSelectedList.value),
        ClassificationSelectedList: unref(ClassificationSelectedList.value),
      });
    }, 100);
  };
  const handleBack = () => {
    changeLoading(true);
    setTimeout(() => {
      emits('back', ICopyEnum.ONTOLOGY);

      currentVirtualTab.value = ClassTypeEnum.CLASS;
    }, 100);
  };

  /** Copy All */
  const handleCopyAll = () => {
    emits('copyAll', ICopyEnum.CLASSES);
    changeLoading(true);
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
        ClassSelectedList.value = [...cardList.value];
      } else {
        ClassificationSelectedList.value = [...cardList.value];
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
  const handleSelected = (selectItem: any, type) => {
    if (type === ClassTypeEnum.CLASS) {
      const index = unref(ClassSelectedList).findIndex((item: any) => selectItem.id === item.id);

      if (index === -1) {
        ClassSelectedList.value = [...ClassSelectedList.value, selectItem];
      } else {
        unref(ClassSelectedList).splice(index, 1);
        ClassSelectedList.value = [...ClassSelectedList.value];
      }
    } else {
      const index = unref(ClassificationSelectedList).findIndex(
        (item: any) => selectItem.id === item.id,
      );

      if (index === -1) {
        ClassificationSelectedList.value = [...ClassificationSelectedList.value, selectItem];
      } else {
        unref(ClassificationSelectedList).splice(index, 1);
        ClassificationSelectedList.value = [...ClassificationSelectedList.value];
      }
    }
  };
  const isDisabled = computed(() => {
    return ClassSelectedList.value.length == 0 && ClassificationSelectedList.value.length == 0;
  });

  /** List */
  const pageNo = ref();
  const total = ref();
  const cardList = ref([]);
  const getList = async (isConcat = false) => {
    changeLoading(true);

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
    changeLoading(false);
  };

  /** Go to Ontology */
  const handleToOntology = () => {
    const url = RouteEnum.ONTOLOGY;
    go(url);
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

  /** Cancel Callback */
  emitter.off('cancelClass');
  emitter.on('cancelClass', () => {
    console.log('cancel class');
    ClassSelectedList.value = [];
    ClassificationSelectedList.value = [];
  });
  const handleCancel = () => {
    emitter.emit('cancelOntology');
    emitter.emit('cancelClass');
    emitter.emit('cancelConflict');
  };
</script>
<style lang="less" scoped>
  @import './index.less';
</style>
