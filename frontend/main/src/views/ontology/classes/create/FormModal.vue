<template>
  <div :class="`${prefixCls}`">
    <BasicModal
      v-bind="$attrs"
      @register="register"
      destroyOnClose
      wrapClassName="ontology-class-modal"
      :width="600"
      :height="700"
    >
      <template #title>
        <Icon
          @click="handleCancel"
          style="cursor: pointer; color: #000; margin-right: 5px"
          icon="ic:outline-arrow-back"
        />
        <span>{{ modalTitle }}</span>
      </template>
      <div class="modal animate-fadeIn animate-animated" v-loading="loadingRef">
        <div class="modal__left">
          <div class="modal__left--title">{{ t('business.ontology.modal.treeGraph') }}</div>
          <ClassesTree
            v-if="activeTab === ClassTypeEnum.CLASS"
            :activeTab="activeTab"
            :dataSchema="classDataSchema"
            :indexList="indexList"
            @select="handleTreeSelect"
          />
          <ClassesTree
            v-else
            :activeTab="activeTab"
            :dataSchema="dataSchema"
            :indexList="indexList"
            @select="handleTreeSelect"
          />
        </div>
        <div class="modal__right">
          <div class="modal__right-content">
            <OptionEditor
              v-show="showOptionForm"
              :type="editorType"
              :isBasic="true"
              :dataSchema="activeTab === ClassTypeEnum.CLASS ? classDataSchema : dataSchema"
              :handleSet="handleSet"
              :handleAddIndex="handleAddIndex"
            />
            <template v-if="toggle">
              <component
                v-if="activeTab === ClassTypeEnum.CLASS"
                :activeTab="activeTab"
                :is="component"
                :dataSchema="classDataSchema"
                :detail="props.detail"
                :indexList="indexList"
                :handleSet="handleSet"
                :handleAddIndex="handleAddIndex"
                :handleRemoveIndex="handleRemoveIndex"
                @done="handleDone"
                @del="handleDel"
                @changeIndexList="handleChangeIndexList"
                @createSave="handleCreateSave"
                @valid="handleValid"
              />
              <component
                v-else
                :activeTab="activeTab"
                :is="component"
                :dataSchema="dataSchema"
                :detail="props.detail"
                :indexList="indexList"
                :handleSet="handleSet"
                :handleAddIndex="handleAddIndex"
                :handleRemoveIndex="handleRemoveIndex"
                @done="handleDone"
                @del="handleDel"
                @changeIndexList="handleChangeIndexList"
                @createSave="handleCreateSave"
                @valid="handleValid"
              />
            </template>
          </div>
        </div>
      </div>
      <template #footer>
        <Button type="default" @click="handleCancel">
          {{ t('common.cancelText') }}
        </Button>
        <Button type="primary" @click="handleCall" :disabled="isValid">
          {{ modalOkText }}
        </Button>
      </template>
    </BasicModal>
    <DiscardModal @register="discardRegister" @close="handleClose" />
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, computed, watch, defineEmits, defineProps, inject, provide } from 'vue';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { setSchema, setClassSchema, handleMutiTabAction } from './components/utils';
  import emitter from 'tiny-emitter/instance';

  import { Button } from 'ant-design-vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import Icon from '/@/components/Icon';
  import ClassesTree from './components/ClassesTree.vue';
  import AttrForm from './components/AttrForm.vue';
  import OptionForm from './components/OptionForm.vue';
  import DiscardModal from './components/DiscardModal.vue';
  import OptionEditor from './components/OptionEditor.vue';

  import {
    ClassItem,
    ClassificationItem,
    ClassTypeEnum,
    datasetTypeEnum,
  } from '/@/api/business/model/ontologyClassesModel';
  import { createEditClassApi, createEditClassificationApi } from '/@/api/business/ontologyClasses';
  import {
    createDatasetClassApi,
    updateDatasetClassApi,
    createDatasetClassificationApi,
    updateDatasetClassificationApi,
  } from '/@/api/business/datasetOntology';

  const { t } = useI18n();
  const { prefixCls } = useDesign('form-drawer');
  const modalTitle = ref<string>('');

  const [register, { closeModal }] = useModalInner();
  const [discardRegister, { openModal: openDiscardModal }] = useModal();

  const emits = defineEmits(['fetchList', 'back']);

  const props = withDefaults(
    defineProps<{
      detail: any;
      activeTab: ClassTypeEnum;
      isCenter?: boolean;
      datasetType?: datasetTypeEnum;
      ontologyId?: Nullable<number>;
      datasetId?: Nullable<number>;
      classId?: Nullable<number>;
      classificationId?: Nullable<number>;
    }>(),
    {
      isCenter: true,
      datasetType: datasetTypeEnum.IMAGE,
    },
  );
  const modalOkText = ref<string>(t('common.createText'));

  const indexList = ref<number[]>([]);

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

  // The empty attributes | options
  type dataType = {
    attributes?: any[];
    options?: any[];
  };
  const getInitClassData = (): dataType => {
    return { attributes: [] };
  };
  const getInitClassificationData = (): dataType => {
    return { options: [] };
  };

  // initial
  const classDataSchema = ref(getInitClassData());
  const dataSchema = ref(getInitClassificationData());

  const loadingRef = ref<boolean>(false);
  watch(
    [classDataSchema, dataSchema, indexList],
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
    emits('back');
    return;
    // Judgment is Edit
    if (props.detail?.id) {
      console.log(isChangedByUser, isShowEdit);
      // Determine if the user has changed
      // -- judge whether isShowEdit is not filled
      if (isChangedByUser.value) {
        openDiscardModal();
      } else if (isShowEdit.value) {
        openDiscardModal();
      } else {
        handleClose();
      }
    } else if (props?.classId || props?.classificationId) {
      // The copy from
      openDiscardModal();
    } else {
      openDiscardModal();
    }
  };
  const handleClose = () => {
    isChangedByUser.value = false;
    updateDetail({});
    closeModal();
  };

  watch(
    () => props.detail,
    () => {
      handleDetail();
    },
  );

  // Data initial rendering
  const handleDetail = async () => {
    // isEdit
    if (props.detail?.id) {
      // Edit Echo
      modalOkText.value = t('common.saveText');
      modalTitle.value =
        props.activeTab == ClassTypeEnum.CLASS
          ? t('business.class.editClass')
          : t('business.class.editClassification');
      handleValid(false);

      // Echo Attribute | Option
      handleMutiTabAction(
        props.activeTab,
        () => {
          // Echo attributes
          classDataSchema.value = {
            attributes: (props.detail as ClassItem)?.attributes
              ? (props.detail as ClassItem).attributes
              : [],
          };
        },
        () => {
          // Echo options
          dataSchema.value = {
            options: (props.detail as ClassificationItem)?.options
              ? (props.detail as ClassificationItem)!.options
              : [],
          };
        },
      );
    } else if (props?.classId || props?.classificationId) {
      // Copy From
      modalOkText.value = t('common.createText');
      modalTitle.value =
        props.activeTab == ClassTypeEnum.CLASS
          ? t('business.ontology.copy.copyClass')
          : t('business.ontology.copy.copyClassification');
      handleValid(false);

      // Copy Attribute | Option
      handleMutiTabAction(
        props.activeTab,
        () => {
          // copy attributes
          classDataSchema.value = {
            attributes: (props.detail as ClassItem)?.attributes
              ? (props.detail as ClassItem)!.attributes
              : [],
          };
        },
        () => {
          // copy options
          dataSchema.value = {
            options: (props.detail as ClassificationItem)?.options
              ? (props.detail as ClassificationItem)!.options
              : [],
          };
        },
      );
    } else {
      // Create
      // class - classification
      modalOkText.value = t('common.createText');
      modalTitle.value =
        props.activeTab == ClassTypeEnum.CLASS
          ? t('business.class.createNewClass')
          : t('business.class.createNewClassification');
      handleValid(true);
      // create - empty
      classDataSchema.value = getInitClassData();
      dataSchema.value = getInitClassificationData();
    }
    // initial indexList
    indexList.value = [];
  };

  // The button state
  const isValid = ref<boolean>(true);
  const handleValid = (value: boolean) => {
    isValid.value = value;
  };

  // tree node event
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

  // Adjust the current indexList
  const handleChangeIndexList = (newIndexList) => {
    toggle.value = false;
    setTimeout(() => {
      toggle.value = true;
      indexList.value = newIndexList.map((item) => Number(item));
    });
  };

  // Set value for class | classification
  const handleSet = (setOption) => {
    handleMutiTabAction(
      props.activeTab,
      () => {
        setClassSchema(classDataSchema, indexList.value, setOption);
      },
      () => {
        setSchema(dataSchema, indexList.value, setOption);
      },
    );
  };

  // Next level
  const handleAddIndex = (index: number) => {
    unref(indexList).push(index);
  };
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
      setClassSchema(classDataSchema, indexList.value, { setType: 'delete' });
    } else {
      setSchema(dataSchema, indexList.value, { setType: 'delete' });
    }
    unref(indexList).pop();
  };

  // Confirm to create or save
  const handleCall = () => {
    // Submit the form first
    emitter.emit('handleSubmitForm');
  };

  // Create & Save -- After passing the verification in the Form
  const handleCreateSave = async (data) => {
    // get all data
    const temp = {
      ...data,
      datasetId: props.datasetId,
      ontologyId: props.ontologyId,
      classId: props.classId,
      classificationId: props.classificationId,
    };
    // To handle params
    const params: any = handleParams(temp);
    console.log('The create/save params is :', params);
    // If it is currently attributes, you need to determine whether its options have a value
    handleMutiTabAction(
      props.activeTab,
      async () => {
        try {
          // To judge is OntologyCenter or DatasetOntology
          if (props.isCenter) {
            // OntologyCenter
            await createEditClassApi(params);
          } else {
            // DatasetOntology
            if (params.id) {
              await updateDatasetClassApi(params);
            } else {
              await createDatasetClassApi(params);
            }
          }
          classDataSchema.value = getInitClassData();
          handleClose();
          emits('fetchList');
        } catch (e) {}
      },
      async () => {
        try {
          if (props.isCenter) {
            await createEditClassificationApi(params);
          } else {
            if (params.id) {
              await updateDatasetClassificationApi(params);
            } else {
              await createDatasetClassificationApi(params);
            }
          }
          dataSchema.value = getInitClassificationData();
          handleClose();
          emits('fetchList');
        } catch (e) {}
      },
    );
  };
  // To handle params
  const handleParams = (temp: any) => {
    if (!temp) return {};

    let params;

    if (props.activeTab === ClassTypeEnum.CLASS) {
      params = {
        ontologyId: temp.ontologyId,
        name: temp.name,
        color: temp.color,
        toolType: temp.toolType,
        toolTypeOptions: {},
        attributes: unref(classDataSchema).attributes,
      };
      //  OntologyCenter or DatasetOntology
      if (props.isCenter) {
        // OntologyCenter
      } else {
        // DatasetOntology
        params.datasetId = temp.datasetId;
        params.classId = temp.classId;
      }
      // isEdit
      if (props.detail?.id) {
        params.id = props.detail.id;
      }
      // To judge datasetType, Image or Lidar
      if (temp.datasetType != datasetTypeEnum.IMAGE) {
        params.toolTypeOptions = {
          isConstraints: temp.isConstraints ?? false,
          isStandard: temp.isStandard ?? false,
          length: temp.length,
          width: temp.width,
          height: temp.height,
          points: temp.points,
        };
      } else {
        params.toolTypeOptions = {
          isConstraintsForImage: temp.isConstraintsForImage ?? false,
          imageLimit: temp.imageLimit,
          imageLength: temp.imageLength,
          imageWidth: temp.imageWidth,
          imageArea: temp.imageArea,
        };
      }
    } else {
      params = {
        ontologyId: temp.ontologyId,
        name: temp.name,
        inputType: temp.inputType,
        isRequired: temp.isRequired,
        options: unref(dataSchema).options,
      };

      if (props.isCenter) {
      } else {
        params.datasetId = temp.datasetId;
        params.classificationId = temp.classificationId;
      }

      if (props.detail?.id) {
        params.id = props.detail.id;
      }
    }

    return params;
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
