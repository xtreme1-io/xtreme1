<template>
  <div :class="`${prefixCls}`">
    <BasicModal
      v-bind="$attrs"
      @register="register"
      destroyOnClose
      wrapClassName="ontology-class-modal"
      :maskStyle="maskStyle"
      :closable="false"
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
          <BaseForm
            ref="baseFormRef"
            v-show="showBaseForm"
            v-bind="$attrs"
            :dataSchema="activeTab === ClassTypeEnum.CLASS ? classDataSchema : dataSchema"
            :detail="props.detail"
            :isCenter="props.isCenter"
            :datasetType="props.datasetType"
            :datasetId="(props.datasetId as number)"
            :classId="props.classId"
            :classificationId="props.classificationId"
            :indexList="indexList"
            :handleSet="handleSet"
            :handleAddIndex="handleAddIndex"
            :activeTab="activeTab"
            :handleRemoveIndex="handleRemoveIndex"
            @valid="handleValid"
            @submit="handleSubmit"
            @changed="hasChanged"
          />
          <!-- toggle - 在切换组件时，先销毁组件再创建，防止数据混乱 -->
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
  import {
    ref,
    reactive,
    unref,
    computed,
    watch,
    defineEmits,
    defineProps,
    inject,
    provide,
  } from 'vue';
  // 工具
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { setSchema, setClassSchema, handleMutiTabAction } from './modal-components/utils';
  import emitter from 'tiny-emitter/instance';
  // 组件
  import { Button } from 'ant-design-vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import Icon from '/@/components/Icon';
  import ClassesTree from './modal-components/ClassesTree.vue';
  import BaseForm from './modal-components/BaseForm.vue';
  import AttrForm from './modal-components/AttrForm.vue';
  import OptionForm from './modal-components/OptionForm.vue';
  import DiscardModal from './modal-components/DiscardModal.vue';
  // 接口
  import {
    ClassItem,
    ClassificationItem,
    ClassTypeEnum,
    datasetTypeEnum,
  } from '/@/api/business/model/ontologyClassesModel';
  import { createEditClassApi, createEditClassificationApi } from '/@/api/business/ontologyClasses';
  import {
    createEditClassApi as createEditClassApiForDataset,
    createEditClassificationApi as createEditClassificationApiForDataset,
  } from '/@/api/business/datasetOntology';

  const { t } = useI18n();
  const { prefixCls } = useDesign('form-drawer');
  const modalTitle = ref<string>('');

  // const [register, { closeDrawer }] = useDrawerInner();
  const [register, { closeModal }] = useModalInner();
  const [discardRegister, { openModal: openDiscardModal }] = useModal();
  // 遮罩层样式
  const maskStyle = reactive({
    background:
      'linear-gradient(180deg, rgba(87, 204, 239, 0.12) 0%, rgba(134, 229, 201, 0.12) 100%), #FFFFFF',
  });

  const emits = defineEmits(['fetchList']);

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

  // 渲染组件 baseForm ,v-show切换，防止数据丢失
  const baseFormRef = ref<InstanceType<typeof BaseForm>>();
  // 通过 indexList 长度判断是否显示 BasicInfo
  const showBaseForm = computed(() => {
    if (unref(indexList).length === 0) {
      return true;
    } else {
      return false;
    }
  });
  // attributes | options 组件
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

  // 创建空的 attributes | options
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
  // 初始化
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

  // optionEditor 输入框
  const isShowEdit = ref<boolean>(false);
  provide('isShowEdit', isShowEdit);
  const changeShowEdit = (value: boolean) => {
    isShowEdit.value = value;
  };
  provide('changeShowEdit', changeShowEdit);
  const isChangedByUser = ref<boolean>(false);
  // 用户改变了某些数据会触发这个事件
  const hasChanged = () => {
    console.log('触发 hasChanged');
    // 改变状态
    isChangedByUser.value = true;
    // 停止监听 -- 状态已经改变不需要再监听了
    // watchChangedByUser();
  };
  // 关闭弹窗事件
  const updateDetail = inject('updateDetail', Function, true);
  const handleCancel = () => {
    // 先判断是编辑
    if (props.detail?.id) {
      console.log(isChangedByUser, isShowEdit);
      // 判断用户是否改变
      // -- 同时判断 isShowEdit 是否未填
      if (isChangedByUser.value) {
        openDiscardModal();
      } else if (isShowEdit.value) {
        openDiscardModal();
      } else {
        handleClose();
      }
    } else if (props?.classId || props?.classificationId) {
      // copy from 的情况
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

  // 调整为监听 detail 变化 调用
  // -- 在 updated 里面 会导致修改 baseForm 数据时也会调用
  watch(
    () => props.detail,
    () => {
      handleDetail();
    },
  );

  // 数据初始渲染
  const handleDetail = async () => {
    // 异步请求的数据，在这里无法获取
    // console.log('handleDetail', props.detail, props.activeTab);
    // 判断是否是编辑
    // -- 但 copy 时也是没有 id 的
    if (props.detail?.id) {
      // 当前为 编辑回显状态
      modalOkText.value = t('common.saveText');
      modalTitle.value =
        props.activeTab == ClassTypeEnum.CLASS
          ? t('business.class.editClass')
          : t('business.class.editClassification');
      handleValid(false);

      // 回显 Attribute | Option
      handleMutiTabAction(
        props.activeTab,
        () => {
          // 回显 attributes
          classDataSchema.value = {
            attributes: (props.detail as ClassItem)?.attributes
              ? (props.detail as ClassItem).attributes
              : [],
          };
        },
        () => {
          // 回显 options
          dataSchema.value = {
            options: (props.detail as ClassificationItem)?.options
              ? (props.detail as ClassificationItem)!.options
              : [],
          };
        },
      );
    } else if (props?.classId || props?.classificationId) {
      // 当前为 DatasetOntology 里的 copy from 状态
      modalOkText.value = t('common.createText');
      modalTitle.value =
        props.activeTab == ClassTypeEnum.CLASS
          ? t('business.ontology.copy.copyClass')
          : t('business.ontology.copy.copyClassification');
      handleValid(false);

      // copy Attribute | Option
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
      // 当前为 新建状态
      // class - classification
      modalOkText.value = t('common.createText');
      modalTitle.value =
        props.activeTab == ClassTypeEnum.CLASS
          ? t('business.class.createNewClass')
          : t('business.class.createNewClassification');
      handleValid(true);
      // create - 空
      classDataSchema.value = getInitClassData();
      dataSchema.value = getInitClassificationData();
    }
    // 初始化 indexList
    indexList.value = [];
  };

  // 按钮状态
  const isValid = ref<boolean>(true);
  const handleValid = (value: boolean) => {
    isValid.value = value;
  };

  // 点击 tree node
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

    // 首次加载 formModal 不会加载 AttrForm | OptionForm
    if (emitter.e.handleSaveForm && oldSelectList[0] != 'root') {
      // 提交表单
      emitter.emit('handleSaveForm', {
        type: 'tree',
        indexList: newIndexList, // 新
        selectList: oldSelectList, // 旧
      });
    } else {
      handleChangeIndexList(newIndexList);
    }
  };
  // 调整当前 indexList
  const handleChangeIndexList = (newIndexList) => {
    toggle.value = false;
    setTimeout(() => {
      toggle.value = true;
      indexList.value = newIndexList.map((item) => Number(item));
    });
  };

  // 设置值
  const handleSet = (setOption) => {
    // isChanged.value = true;
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
  // 下一层
  const handleAddIndex = (index: number) => {
    unref(indexList).push(index);
  };
  // 上一层
  const handleRemoveIndex = () => {
    unref(indexList).pop();
  };
  // 保存
  const handleDone = () => {
    // emitter.emit('handleSaveForm');
    handleRemoveIndex();
  };
  // 删除
  const handleDel = () => {
    if (props.activeTab === ClassTypeEnum.CLASS) {
      setClassSchema(classDataSchema, indexList.value, { setType: 'delete' });
    } else {
      setSchema(dataSchema, indexList.value, { setType: 'delete' });
    }
    unref(indexList).pop();
  };

  // 确认创建、保存
  const handleCall = () => {
    // 先去提交表单
    emitter.emit('handleSubmitForm');
  };
  // 提交 -- 由 baseForm 中触发提交
  const handleSubmit = async (data) => {
    console.log('调用 formModal handleSubmit');
    // 这里，要对 form 的 name 作校验
    // -- 包括 BaseForm | AttrForm | OptionForm
    // -- baseForm 校验成功才会执行这里

    // 校验 AttrForm | OptionForm
    if (indexList.value.length > 0) {
      console.log('校验 AttrForm | OptionForm');
      emitter.emit('handleSaveForm', {
        type: 'create',
        data: data,
      });
    } else {
      handleCreateSave(data);
    }
  };
  // 创建、保存 -- 由 Form 里校验通过后提交
  const handleCreateSave = async (data) => {
    // 获取所有数据
    const temp = {
      ...data,
      datasetId: props.datasetId,
      ontologyId: props.ontologyId,
      classId: props.classId,
      classificationId: props.classificationId,
    };
    // 处理参数
    const params: any = handleParams(temp);
    console.log('------>', params);
    // 如果当前是 attributes, 需要判断其 options 是否有值
    handleMutiTabAction(
      props.activeTab,
      async () => {
        try {
          // 判断 OntologyCenter | DatasetOntology
          if (props.isCenter) {
            // OntologyCenter
            await createEditClassApi(params);
          } else {
            // DatasetOntology
            await createEditClassApiForDataset(params);
          }

          classDataSchema.value = getInitClassData();
          handleClose();
          emits('fetchList');
        } catch (e) {}
      },
      async () => {
        try {
          // 判断 OntologyCenter | DatasetOntology
          if (props.isCenter) {
            // OntologyCenter
            await createEditClassificationApi(params);
          } else {
            // DatasetOntology
            await createEditClassificationApiForDataset(params);
          }

          dataSchema.value = getInitClassificationData();
          handleClose();
          emits('fetchList');
        } catch (e) {}
      },
    );
  };
  // 处理参数
  const handleParams = (temp: any) => {
    if (!temp) return {};

    let params;

    if (props.activeTab === ClassTypeEnum.CLASS) {
      params = {
        ontologyId: temp.ontologyId,
        name: temp.name,
        color: temp.color,
        toolType: temp.toolType,
        // 0.3 版本修改为直传,不需要 stringify
        toolTypeOptions: {}, // 0.5 修改为根据 datasetType 判断传参
        attributes: unref(classDataSchema).attributes,
      };
      // 判断 OntologyCenter | DatasetOntology
      if (props.isCenter) {
        // OntologyCenter
        // 0.3 版本不需要传 datasetType
        // params.datasetType = temp.datasetType;
      } else {
        // DatasetOntology
        params.datasetId = temp.datasetId;
        params.classId = temp.classId;
      }
      // 是否为编辑
      if (props.detail?.id) {
        params.id = props.detail.id;
      }
      // 判断 datasetType
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
        // options: JSON.stringify(unref(dataSchema).options),
        // 0.3 版本修改为直传
        options: unref(dataSchema).options,
      };
      // 判断 OntologyCenter | DatasetOntology
      if (props.isCenter) {
        // OntologyCenter
      } else {
        // DatasetOntology
        params.datasetId = temp.datasetId;
        params.classificationId = temp.classificationId;
      }
      // 是否为编辑
      if (props.detail?.id) {
        params.id = props.detail.id;
      }
    }

    return params;
  };
</script>
<style lang="less" scoped>
  .modal {
    display: flex;
    justify-content: space-between;
    height: calc(100vh - 110px);
    overflow: hidden;

    .modal__left {
      width: 270px;
      height: 100%;
      // overflow: auto;
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
      width: 270px;
      overflow: auto;
      padding: 15px;
      // border-left: 1px solid #ccc;
      // padding-right: 15px;
      &::before {
        content: '';
        position: absolute;
        top: 15px;
        left: 0px;
        display: block;
        width: 1px;
        height: calc(100vh - 140px);
        background: #cccccc;
      }
    }
  }
</style>
<style lang="less">
  // 需要在全局中写样式
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
</style>
