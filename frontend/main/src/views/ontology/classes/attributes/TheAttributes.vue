<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    destroyOnClose
    wrapClassName="ontology-class-modal"
    :width="650"
    :height="700"
    @cancel="handleCancel"
    :okText="'Confirm'"
    :okButtonProps="{
      // disabled: isValid,
    }"
    @ok="handleConfirm"
  >
    <template #title>
      <Icon
        @click="handleCancel"
        style="cursor: pointer; color: #000; margin-right: 5px"
        icon="ic:outline-arrow-back"
      />
      <span>{{ props.title }}</span>
    </template>
    <div class="modal animate-fadeIn animate-animated" v-loading="loadingRef">
      <div class="modal__left">
        <ClassesTree
          :activeTab="activeTab"
          :dataSchema="dataSchema"
          :indexList="indexList"
          @select="handleTreeSelect"
        />
      </div>
      <div class="modal__right">
        <div class="modal__right-content">
          <!-- Option | Attributes -->
          <OptionEditor
            v-if="showOptionForm"
            :type="editorType"
            :isBasic="true"
            :dataSchema="dataSchema"
          />
          <template v-if="toggle">
            <component
              ref="attributeRef"
              :is="component"
              :activeTab="activeTab"
              :dataSchema="dataSchema"
              :indexList="indexList"
              @done="handleDone"
              @del="handleDel"
              @changeIndexList="handleChangeIndexList"
              @createSave="handleConfirm"
              @update="handleUpdateDataSchema"
              @close="
                () => {
                  emits('back');
                }
              "
            />
          </template>
        </div>
      </div>
    </div>
  </BasicModal>
  <DiscardModal @register="discardRegister" @close="handleClose" />
</template>
<script lang="ts" setup>
  import { ref, unref, computed, watch, defineEmits, defineProps, inject, provide } from 'vue';

  // import { useI18n } from '/@/hooks/web/useI18n';
  import { setSchema, setClassSchema } from './utils';
  import emitter from 'tiny-emitter/instance';

  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import Icon from '/@/components/Icon';
  import ClassesTree from './ClassesTree.vue';
  import AttrForm from './AttrForm.vue';
  import OptionForm from './OptionForm.vue';
  import DiscardModal from './DiscardModal.vue';
  import OptionEditor from './OptionEditor.vue';

  import {
    // ClassItem,
    // ClassificationItem,
    ClassTypeEnum,
    datasetTypeEnum,
  } from '/@/api/business/model/ontologyClassesModel';
  // import { createEditClassApi, createEditClassificationApi } from '/@/api/business/ontologyClasses';
  // import {
  //   createDatasetClassApi,
  //   updateDatasetClassApi,
  //   createDatasetClassificationApi,
  //   updateDatasetClassificationApi,
  // } from '/@/api/business/datasetOntology';
  import { IDataSchema } from '../create/typing';

  // const { t } = useI18n();
  // const modalTitle = ref<string>('Create');
  // const modalOkText = ref<string>('Confirm');
  // Set value for class | classification

  /** Modal */
  const [register, { closeModal }] = useModalInner(() => {
    emitter.emit('changeRootName', props.formState.name || 'Root');
    dataSchema.value = props.dataSchema;
    console.log('===>', dataSchema.value);
    indexList.value = [];
  });
  const [discardRegister, { openModal: openDiscardModal }] = useModal();

  const emits = defineEmits(['fetchList', 'back', 'update', 'create']);
  const props = withDefaults(
    defineProps<{
      formState: any;
      dataSchema: IDataSchema;
      activeTab: ClassTypeEnum;
      isCenter?: boolean;
      datasetType?: datasetTypeEnum;
      ontologyId?: Nullable<number>;
      datasetId?: Nullable<number>;
      classId?: Nullable<number>;
      classificationId?: Nullable<number>;
      title: string;
    }>(),
    {
      isCenter: true,
      datasetType: datasetTypeEnum.IMAGE,
    },
  );

  const attributeRef = ref();
  // The Components: attributes | options
  const component = computed(() => {
    if (unref(indexList).length === 0) {
      return null;
    }

    if (props.activeTab === ClassTypeEnum.CLASS) {
      // class
      if (unref(indexList).length % 2 !== 0) {
        return AttrForm;
      } else if (unref(indexList).length % 2 === 0) {
        return OptionForm;
      }
    } else {
      // classification
      if (unref(indexList).length % 2 === 0) {
        return AttrForm;
      } else if (unref(indexList).length % 2 !== 0) {
        return OptionForm;
      }
    }

    return null;
  });

  /** DataSchema */
  const dataSchema = ref<IDataSchema>({});
  const handleSetDataSchema = (setOption) => {
    console.log(setOption);
    if (props.activeTab === ClassTypeEnum.CLASS) {
      setClassSchema(dataSchema.value, indexList.value, setOption);
    } else {
      setSchema(dataSchema.value, indexList.value, setOption);
    }
  };
  provide('handleSetDataSchema', handleSetDataSchema);

  /** indexList */
  const indexList = ref<number[]>([]);
  const loadingRef = ref<boolean>(false);
  const handleChangeIndexList = (newIndexList) => {
    toggle.value = false;
    setTimeout(() => {
      toggle.value = true;
      indexList.value = newIndexList.map((item) => Number(item));
    });
  };
  // Next level
  const handleAddIndex = (index: number) => {
    unref(indexList).push(index);
  };
  provide('handleAddIndex', handleAddIndex);
  // Previous level
  const handleRemoveIndex = () => {
    unref(indexList).pop();
  };
  // Save
  const handleDone = () => {
    handleRemoveIndex();
  };
  // Delete
  const handleDel = () => {
    if (props.activeTab === ClassTypeEnum.CLASS) {
      setClassSchema(dataSchema.value, indexList.value, { setType: 'delete' });
    } else {
      setSchema(dataSchema.value, indexList.value, { setType: 'delete' });
    }
    unref(indexList).pop();
  };
  watch(
    indexList,
    () => {
      loadingRef.value = true;
      setTimeout(() => {
        loadingRef.value = false;
      });
    },
    {
      immediate: true,
      deep: true,
    },
  );

  /** Tree */
  const toggle = ref<boolean>(true);
  const handleTreeSelect = (selectList: String[]) => {
    let newIndexList = [''];
    if (selectList[0] != 'root') {
      newIndexList = unref(selectList)[0].split('');
    }
    newIndexList.shift();

    let oldSelectList;

    if (indexList.value.length == 0) {
      oldSelectList = ['root'];
    } else {
      oldSelectList = ['0' + indexList.value.join('')];
    }

    // Loading formModal for the first time does not load AttrForm | OptionForm
    if (emitter.e.handleSaveForm && oldSelectList[0] != 'root') {
      // Submit Form
      emitter.emit('handleSaveForm', {
        type: 'tree',
        indexList: newIndexList, // new
        selectList: oldSelectList, // old
      });
    } else {
      handleChangeIndexList(newIndexList);
    }
  };

  // optionEditor input
  const isShowEdit = ref<boolean>(false);
  provide('isShowEdit', isShowEdit);
  const changeShowEdit = (value: boolean) => {
    isShowEdit.value = value;
  };
  provide('changeShowEdit', changeShowEdit);
  const isChangedByUser = ref<boolean>(false);

  /** Close Popup */
  const updateDetail = inject('updateDetail', Function, true);
  const handleCancel = () => {
    console.log('cancel', indexList.value);
    if (indexList.value.length == 0) {
      emits('back');
    } else {
      emitter.emit('handleSaveForm', { type: 'close' });
    }
    return;
    openDiscardModal();
    // // Judgment is Edit
    // if (props.detail?.id) {
    //   console.log(isChangedByUser, isShowEdit);
    //   // Determine if the user has changed
    //   // -- judge whether isShowEdit is not filled
    //   if (isChangedByUser.value) {
    //     openDiscardModal();
    //   } else if (isShowEdit.value) {
    //     openDiscardModal();
    //   } else {
    //     handleClose();
    //   }
    // } else if (props?.classId || props?.classificationId) {
    //   // The copy from
    //   openDiscardModal();
    // } else {
    //   openDiscardModal();
    // }
  };
  const handleClose = () => {
    isChangedByUser.value = false;
    updateDetail({});
    closeModal();
  };

  /** okButtonProps */
  const isValid = ref<boolean>(true);
  const handleUpdateValid = (valid: boolean) => {
    isValid.value = valid;
  };
  provide('handleUpdateValid', handleUpdateValid);

  const handleConfirm = () => {
    emitter.emit('handleSaveForm', { type: 'confirm' });
  };
  // Confirm to create or save
  const handleUpdateDataSchema = async () => {
    emits('update', dataSchema.value);
    console.log(props.dataSchema);
  };

  const showOptionForm = computed(() => {
    if (unref(indexList).length === 0) {
      return true;
    } else {
      return false;
    }
  });

  // Pass it to the child component to judge the display field
  const editorType = computed(() => {
    return props.activeTab === ClassTypeEnum.CLASS ? 'attributes' : 'options';
  });
</script>
<style lang="less" scoped>
  .modal {
    display: flex;
    justify-content: space-between;
    height: 600px;
    overflow: hidden;

    .modal__left {
      flex: 1;
      height: 100%;
      padding: 15px;
      padding-right: 5px;

      &--title {
        font-weight: 500; //font-weight: 600;

        font-size: 16px;
        line-height: 19px;

        color: #333333;
      }
    }

    .modal__right {
      position: relative;
      flex: 1;
      padding: 15px;
      padding-right: 0;
      overflow: hidden;
      &::before {
        content: '';
        position: absolute;
        top: 15px;
        left: 0px;
        display: block;
        width: 1px;
        height: 580px;
        background: #cccccc;
      }
      &-content {
        overflow: auto;
        height: 100%;
        padding-right: 15px;
      }
    }
  }
</style>
<!-- <style lang="less">
  .ontology-class-modal {
    .ant-modal {
      height: 100vh;
      top: 0;
      width: 540px !important;
      margin-top: 0;
      margin-bottom: 0;

      .ant-modal-content {
        box-shadow: unset;
        border-radius: unset;
      }

      .ant-modal-header {
        height: 50px;
      }

      .ant-modal-body {
        height: calc(100vh - 110px);

        .scrollbar {
          padding: 0;

          .scrollbar__bar {
            display: none;
          }
        }
      }

      .ant-modal-footer {
        height: 60px;
      }
    }
  }
</style> -->