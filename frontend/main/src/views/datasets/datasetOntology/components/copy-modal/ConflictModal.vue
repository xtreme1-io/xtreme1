<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    centered
    destroyOnClose
    @cancel="handleCancel"
    @ok="handleConfirm"
    okText="Confirm"
    :width="1000"
    :height="750"
  >
    <template #title>
      <BackTitle :title="modalTitle" @back="handleBack" />
    </template>
    <div class="copy__modal">
      <div class="header">
        <span>
          Some Classes/ Classifications have already existed in your ontology. To resolve these
          conflicts, please choose to
          <span class="weight">Keep</span>
          Original or to
          <span class="weight">Replace</span>
          Original with New Classes/ Classifications.
        </span>
      </div>
      <div class="conflict__list">
        <div class="wrapper-inner">
          <div class="title">Classes</div>
          <div class="action">
            <span class="highLight" @click="handleToggleKeepAll(ClassTypeEnum.CLASS, false)">
              Replace All
            </span>
            <span class="highLight" @click="handleToggleKeepAll(ClassTypeEnum.CLASS, true)">
              Keep All
            </span>
          </div>
          <CustomTable
            ref="classRef"
            class="table"
            :type="ClassTypeEnum.CLASS"
            :list="conflictClassList"
          />
        </div>
        <div class="wrapper-inner">
          <div class="title">Classifications</div>
          <div class="action">
            <span
              class="highLight"
              @click="handleToggleKeepAll(ClassTypeEnum.CLASSIFICATION, false)"
            >
              Replace All
            </span>
            <span
              class="highLight"
              @click="handleToggleKeepAll(ClassTypeEnum.CLASSIFICATION, true)"
            >
              Keep All
            </span>
          </div>
          <CustomTable
            ref="classificationRef"
            class="table"
            :type="ClassTypeEnum.CLASSIFICATION"
            :list="conflictClassificationList"
          />
        </div>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  // import { useI18n } from '/@/hooks/web/useI18n';
  // components
  import emitter from 'tiny-emitter/instance';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ICopyEnum } from './data';
  import CustomTable from './CustomTable.vue';
  import BackTitle from './BackTitle.vue';
  import { ClassTypeEnum } from '/@/api/business/model/classModel';

  // const { t } = useI18n();

  const emits = defineEmits(['back', 'confirm']);

  const modalTitle = ref<string>('Copy from Ontology Center');
  // const isDisabled = ref<boolean>(true);

  const conflictClassList = ref<any[]>([]);
  const conflictClassificationList = ref<any[]>([]);

  const classificationRef = ref();
  const classRef = ref();

  /** Modal */
  const backType = ref<ICopyEnum>(ICopyEnum.CLASSES);
  const [registerModal, { closeModal }] = useModalInner((config) => {
    backType.value = config.type;

    conflictClassList.value = config.conflictClassList.map((item) => {
      item.isKeep = false;
      return item;
    });
    conflictClassificationList.value = config.conflictClassificationList.map((item) => {
      item.isKeep = false;
      return item;
    });
  });
  const handleBack = () => {
    closeModal();
    setTimeout(() => {
      emits('back', backType.value);
    }, 100);
  };

  /** Toggle keep */
  const handleToggleKeepAll = (type: ClassTypeEnum, isKeep: boolean) => {
    if (type == ClassTypeEnum.CLASS) {
      conflictClassList.value.forEach((item) => (item.isKeep = isKeep));
    } else {
      conflictClassificationList.value.forEach((item) => (item.isKeep = isKeep));
    }
  };

  /** Confirm Conflict */
  const handleConfirm = () => {
    const classList = conflictClassList.value.filter((item) => !item.isKeep);
    const classificationList = conflictClassificationList.value.filter((item) => !item.isKeep);

    emits('confirm', classList, classificationList);
    closeModal();
  };

  /** Cancel Callback */
  emitter.off('cancelConflict');
  emitter.on('cancelConflict', () => {
    console.log('cancel conflict');
    conflictClassList.value = [];
    conflictClassificationList.value = [];
    classificationRef.value = undefined;
    classRef.value = undefined;
  });
  const handleCancel = () => {
    emitter.emit('cancelOntology');
    emitter.emit('cancelClass');
    emitter.emit('cancelConflict');
  };
</script>
<style scoped lang="less">
  .copy__modal {
    min-height: 600px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 6px;
    .header {
      height: 50px;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: #666;
      .weight {
        font-weight: 500;
        color: #333;
      }
    }
    .conflict__list {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 40px;
      .wrapper-inner {
        height: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
        .title {
          height: 24px;
          font-weight: 500;
          font-size: 16px;
          line-height: 24px;
          color: #333;
        }
        .action {
          display: flex;
          gap: 20px;
          height: 16px;
          font-weight: 400;
          font-size: 14px;
          line-height: 16px;
          color: @primary-color;
          cursor: pointer;
        }
        .table {
          flex: 1;
          height: 100%;
        }
      }
    }
  }
</style>
