<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    destroyOnClose
    @cancel="handleCancel"
    @ok="handleConfirm"
    okText="Confirm"
    :okButtonProps="{ disabled: isDisabled }"
    :width="1000"
    :height="600"
  >
    <template #title>
      <div class="flex items-center">
        <Icon
          icon="eva:arrow-back-fill"
          color="#aaa"
          class="mr-10px cursor-pointer"
          size="24px"
          @click="handleBack"
        />
        <Icon icon="fluent:info-16-filled" color="#FCB17A" class="mr-8px" size="24px" />
        <span> {{ 'Conflicts' }} </span>
      </div>
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
      <div class="conflict__list h-518px">
        <div class="wrapper-inner">
          <div class="title">Classes</div>
          <div class="action">
            <span
              class="highLight"
              @click="handleToggleKeepAll(ClassTypeEnum.CLASS, ICopySelectEnum.REPLACE)"
            >
              Replace All
            </span>
            <span
              class="highLight"
              @click="handleToggleKeepAll(ClassTypeEnum.CLASS, ICopySelectEnum.KEEP)"
            >
              Keep All
            </span>
          </div>
          <div v-if="hasData" class="custom_table">
            <CustomTable
              ref="classRef"
              class="table"
              :type="ClassTypeEnum.CLASS"
              :list="conflictClassList"
            />
          </div>
        </div>
        <div class="wrapper-inner">
          <div class="title">Classifications</div>
          <div class="action">
            <span
              class="highLight"
              @click="handleToggleKeepAll(ClassTypeEnum.CLASSIFICATION, ICopySelectEnum.REPLACE)"
            >
              Replace All
            </span>
            <span
              class="highLight"
              @click="handleToggleKeepAll(ClassTypeEnum.CLASSIFICATION, ICopySelectEnum.KEEP)"
            >
              Keep All
            </span>
          </div>
          <div v-if="hasData" class="custom_table">
            <CustomTable
              ref="classificationRef"
              class="table"
              :type="ClassTypeEnum.CLASSIFICATION"
              :list="conflictClassificationList"
            />
          </div>
        </div>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, ref } from 'vue';
  // import { useI18n } from '/@/hooks/web/useI18n';
  // components
  import emitter from 'tiny-emitter/instance';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Icon } from '/@/components/Icon';
  import { ICopyEnum, ICopySelectEnum } from './data';
  import CustomTable from './CustomTable.vue';
  import { ClassTypeEnum } from '/@/api/business/model/classModel';

  // const { t } = useI18n();

  const emits = defineEmits(['back', 'confirm']);

  const conflictClassList = ref<any[]>([]);
  const conflictClassificationList = ref<any[]>([]);
  const hasData = computed(() => {
    return conflictClassList.value.length > 0 || conflictClassificationList.value.length > 0;
  });

  const classificationRef = ref();
  const classRef = ref();

  /** Modal */
  const backType = ref<ICopyEnum>(ICopyEnum.CLASSES);
  const [registerModal, { closeModal, changeLoading }] = useModalInner((config) => {
    changeLoading(false);
    backType.value = config.type;

    conflictClassList.value = (config.conflictClassList ?? []).map((item) => {
      item.isKeep = ICopySelectEnum.NONE;
      return item;
    });

    conflictClassificationList.value = (config.conflictClassificationList ?? []).map((item) => {
      item.isKeep = ICopySelectEnum.NONE;
      return item;
    });
  });
  const handleBack = () => {
    changeLoading(true);
    setTimeout(() => {
      emits('back', backType.value);
    }, 100);
  };

  /** Toggle keep */
  const handleToggleKeepAll = (type: ClassTypeEnum, isKeep: ICopySelectEnum) => {
    console.log(type, isKeep);
    if (type == ClassTypeEnum.CLASS) {
      conflictClassList.value.forEach((item) => (item.isKeep = isKeep));
    } else {
      conflictClassificationList.value.forEach((item) => (item.isKeep = isKeep));
    }
  };

  /** Confirm Conflict */
  const isDisabled = computed(() => {
    return !(
      conflictClassList.value.every((item) => item.isKeep != ICopySelectEnum.NONE) &&
      conflictClassificationList.value.every((item) => item.isKeep != ICopySelectEnum.NONE)
    );
  });
  const handleConfirm = () => {
    const classList = conflictClassList.value.filter(
      (item) => item.isKeep == ICopySelectEnum.REPLACE,
    );
    const classificationList = conflictClassificationList.value.filter(
      (item) => item.isKeep == ICopySelectEnum.REPLACE,
    );

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
    height: 600px;
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
      display: flex;
      gap: 0 40px;
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
        .custom_table {
          flex: 1;
          overflow-y: overlay;
          &::-webkit-scrollbar-track {
            background-color: transparent;
          }
          .table {
            height: 100%;
            width: 100%;
          }
        }
      }
    }
  }
</style>
