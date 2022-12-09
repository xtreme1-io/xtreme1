<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    title="Copy from Ontology Center"
    centered
    destroyOnClose
    @cancel="handleCancel"
    @ok="handleNext"
    :okText="t('business.ontology.copy.next')"
    :okButtonProps="{ disabled: isDisabled }"
    :width="1200"
    :height="750"
  >
    <div class="copy__modal" v-loading="loadingRef">
      <div class="flex items-center mb-15px justify-end">
        <Button type="primary" @click="handleCopyAll" :disabled="isDisabled">
          <span>Copy Entire Ontology</span>
        </Button>
      </div>
      <div class="ontology__list wrapper-outer">
        <div class="wrapper-inner" v-show="cardList.length > 0" style="height: 530px">
          <ScrollContainer ref="scrollRef">
            <OntologyCard
              :cardList="cardList"
              :isOntologyCenter="false"
              v-model:activeCard="selectedOntologyId"
            />
          </ScrollContainer>
        </div>
        <div class="wrapper-inner empty" v-if="cardList.length == 0">
          <div class="empty-wrapper">
            <img src="../../../../../assets/svg/empty.svg" alt="" />
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
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useGo } from '/@/hooks/web/usePage';
  import { RouteEnum } from '/@/enums/routeEnum';
  import emitter from 'tiny-emitter/instance';

  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Button } from '/@@/Button';
  import { ScrollActionType, ScrollContainer } from '/@/components/Container/index';
  import { handleScroll } from '/@/utils/business/scrollListener';
  import OntologyCard from '/@/views/ontology/center/components/OntologyCardNew.vue';

  import { getOntologyApi } from '/@/api/business/ontology';
  import { ICopyEnum } from './data';

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const go = useGo();
  const emits = defineEmits(['copyAll', 'select', 'next']);

  const selectedOntologyId = ref<string | number>();

  const isDisabled = computed(() => {
    return !selectedOntologyId.value;
  });

  /** Modal */
  const [registerModal, { closeModal }] = useModalInner((config) => {
    if (config.isClear) {
      selectedOntologyId.value = undefined;
    }
    getList();
  });
  const handleNext = () => {
    closeModal();
    setTimeout(() => {
      emits('next', selectedOntologyId.value);
      // selectedOntologyId.value = undefined;
    }, 100);
  };

  /** Copy All */
  const handleCopyAll = () => {
    emits('copyAll', ICopyEnum.ONTOLOGY);
  };

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

    try {
      const res: any = await getOntologyApi({
        pageNo: pageNo.value,
        pageSize: 30,
      });
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

  /** Go to Ontology */
  const handleToOntology = () => {
    const url = RouteEnum.ONTOLOGY;
    go(url);
  };

  /** Cancel Callback */
  emitter.off('cancelOntology');
  emitter.on('cancelOntology', () => {
    console.log('cancel ontology');
    selectedOntologyId.value = undefined;
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
