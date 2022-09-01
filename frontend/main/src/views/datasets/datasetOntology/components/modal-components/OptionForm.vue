<template>
  <div class="basic-form">
    <FormHeader
      :dataSchema="props.dataSchema"
      :indexList="props.indexList"
      @back="handleBack"
      @del="handleDelete"
    />
    <BasicForm @register="registerForm" :showActionButtonGroup="false" hideRequiredMark />
    <Divider style="margin: 10px 0" />
    <OptionEditor
      type="attributes"
      :showRequired="showEditorRequired"
      :dataSchema="data"
      :handleSet="handleSet"
      :handleAddIndex="handleAddIndex"
    />
    <!-- discard 弹窗 -->
    <FormDiscard
      :showModal="showDiscardModal"
      @cancel="handleCancelDiscard"
      @discard="handleConfirmDiscard"
    />
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, onMounted, inject } from 'vue';
  // 组件
  import { Divider } from 'ant-design-vue';
  import { BasicForm, useForm } from '/@/components/Form';
  import OptionEditor from './OptionEditor.vue';
  import FormHeader from './FormHeader.vue';
  import FormDiscard from './FormDiscard.vue';
  // 工具
  import emitter from 'tiny-emitter/instance';
  import { optionBase } from './formSchemas';
  import { getSchema, handleMutiTabAction, setClassSchema, setSchema } from './utils';
  // 类型
  import { ClassTypeEnum } from '/@/api/business/model/ontologyClassesModel';

  const emits = defineEmits(['done', 'del', 'changeIndexList', 'createSave', 'valid']);
  const props = defineProps<{
    dataSchema?: any;
    handleSet?: Function;
    handleAddIndex?: Function;
    indexList?: number[];
    activeTab?: ClassTypeEnum;
  }>();

  const data = getSchema(props.dataSchema, props.indexList);
  const { handleSet, handleAddIndex } = unref(props);

  // FormHeader 组件
  // 返回上一级，需要对 options 长度作判断
  const handleBack = () => {
    emitter.emit('handleSaveForm', {
      type: 'back',
    });
  };
  // 删除
  const handleDelete = () => {
    emits('del');
  };

  // FormDiscard 组件
  // 是否显示 InnerDiscardModal
  const showDiscardModal = ref<boolean>(false);
  // 取消 discard
  const handleCancelDiscard = () => {
    showDiscardModal.value = false;
  };
  // 确认 discard
  const handleConfirmDiscard = () => {
    handleDelete();
  };

  // optionEditor 的必填标志
  const showEditorRequired = ref<boolean>(false); // 是否显示 Options 的提示信息

  // 注册 Form
  const [registerForm, { setFieldsValue, validate, getFieldsValue }] = useForm({
    schemas: optionBase,
  });
  // 校验表单 - name
  const validateOptionForm = async () => {
    try {
      await validate();
      return true;
    } catch {
      return false;
    }
  };

  const isShowEdit = inject('isShowEdit');

  emitter.off('handleSaveForm');
  emitter.on('handleSaveForm', async (params?) => {
    const res = await validateOptionForm();
    // console.log('-====', res);
    if (res) {
      if ((isShowEdit as any).value) {
        showDiscardModal.value = true; // 弹窗
        if (params?.type == 'tree') {
          emitter.emit('changeSelected', params.selectList);
        }
        return;
      }
      // 保存表单
      handleMutiTabAction(
        props.activeTab,
        () => {
          setClassSchema(props.dataSchema, props.indexList, {
            setType: 'update',
            setValue: getFieldsValue() as any,
          });
        },
        () => {
          setSchema(props.dataSchema, props.indexList, {
            setType: 'update',
            setValue: getFieldsValue() as any,
          });
        },
      );

      // 如果是 Go
      if (params?.type == 'go') {
        props.handleAddIndex && props.handleAddIndex(params?.index);
      }

      // 如果是树形数据点击，更新 indexList 值
      // -- 更新右侧数据
      if (params?.type == 'tree') {
        emits('changeIndexList', params.indexList);
      }

      // 如果是返回，则抛出 done
      if (params?.type == 'back') {
        emits('done');
      }

      // 创建、保存
      if (params?.type == 'create') {
        emits('createSave', params.data);
      }
    } else {
      showDiscardModal.value = true;
      // 防止树选中节点改变
      if (params?.type == 'tree') {
        emitter.emit('changeSelected', params.selectList);
      }
    }
  });
  onMounted(() => {
    setFieldsValue({
      ...data,
    });
  });
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
