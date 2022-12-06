<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="modalTitle"
    :okText="t('business.ontology.copy.next')"
    centered
    destroyOnClose
    @ok="handleDone"
    :okButtonProps="{ disabled: isDisabled }"
    :width="1000"
    :height="750"
  >
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
  import { useI18n } from '/@/hooks/web/useI18n';
  // components
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ICopyEnum } from './data';
  import CustomTable from './CustomTable.vue';
  import { ClassTypeEnum } from '/@/api/business/model/classModel';

  const { t } = useI18n();
  const modalTitle = ref<string>('Copy from Ontology Center');
  const isDisabled = ref<boolean>(true);

  const conflictClassList = ref<any[]>([]);
  const conflictClassificationList = ref<any[]>([]);

  const classificationRef = ref();
  const classRef = ref();

  /** Modal */
  const backType = ref<ICopyEnum>(ICopyEnum.CLASSES);
  const [registerModal] = useModalInner((config) => {
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

  const handleToggleKeepAll = (type: ClassTypeEnum, isKeep: boolean) => {
    if (type == ClassTypeEnum.CLASS) {
      console.log(type);
      conflictClassList.value.forEach((item) => (item.isKeep = isKeep));
    } else {
      console.log(type);
      conflictClassificationList.value.forEach((item) => (item.isKeep = isKeep));
    }
    console.log(conflictClassList, conflictClassificationList);
  };

  const handleDone = () => {};
</script>
<style scoped lang="less">
  .copy__modal {
    min-height: 600px;
    display: flex;
    flex-direction: column;
    gap: 20px;
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
