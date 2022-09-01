<template>
  <div class="basic-form">
    <FormHeader
      :dataSchema="props.dataSchema"
      :indexList="props.indexList"
      @back="handleBack"
      @del="handleDelete"
    />
    <BasicForm @register="registerForm" :showActionButtonGroup="false" hideRequiredMark>
      <template #inputType="{ model, field }">
        <Select v-model:value="model[field]" @change="handleChangeType">
          <Select.Option v-for="item in inputTypeList" :key="item.key" :value="item.value">
            <div class="img-tool">
              <img :src="item.img" alt="" />
              <span>{{ item.label }}</span>
            </div>
          </Select.Option>
        </Select>
      </template>
    </BasicForm>
    <Divider style="margin: 10px 0" />
    <OptionEditor
      v-if="isShow"
      type="options"
      v-model:showRequired="showEditorRequired"
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
  import { ref, unref, onMounted, watch, inject } from 'vue';
  // 组件
  import { Divider, Select } from 'ant-design-vue';
  import { BasicForm, useForm } from '/@/components/Form';
  import OptionEditor from './OptionEditor.vue';
  import FormHeader from './FormHeader.vue';
  import FormDiscard from './FormDiscard.vue';
  // 工具
  import emitter from 'tiny-emitter/instance';
  import { attributeBase } from './formSchemas';
  import { getSchema, handleMutiTabAction, setClassSchema, setSchema } from './utils';
  // 类型
  import { ClassTypeEnum, inputTypeEnum } from '/@/api/business/model/ontologyClassesModel';
  import { inputTypeList } from './data';

  const emits = defineEmits(['done', 'del', 'changeIndexList', 'createSave', 'valid']);
  const props = defineProps<{
    dataSchema?: any;
    handleSet?: Function;
    handleAddIndex?: Function;
    indexList?: number[];
    activeTab?: ClassTypeEnum;
  }>();

  const { handleSet, handleAddIndex } = unref(props);
  const data = ref<any>();
  data.value = getSchema(props.dataSchema, props.indexList);
  // attrForm 下必有 option
  watch(data.value.options, (newData) => {
    if (newData.length > 0) {
      showEditorRequired.value = false;
    }
  });

  const isShow = ref<boolean>(true);

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

  // BasicForm组件
  // 下拉框切换选择事件
  const handleChangeType = (val) => {
    if (val === inputTypeEnum.TEXT) {
      isShow.value = false;
      // 需要清空 options
      props.handleSet &&
        props.handleSet({
          setType: 'update',
          setValue: { options: [] },
        });
      data.value = getSchema(props.dataSchema, props.indexList);
    } else {
      isShow.value = true;
      data.value = getSchema(props.dataSchema, props.indexList);
    }
    emitter.emit('handleSaveForm', { type: 'change' });
  };
  // 注册 Form
  const [registerForm, { setFieldsValue, validate, getFieldsValue }] = useForm({
    schemas: attributeBase(),
  });
  // 校验表单 - name
  const validateAttrForm = async () => {
    try {
      await validate();
      return true;
    } catch {
      return false;
    }
  };

  const isShowEdit = inject('isShowEdit');

  emitter.off('handleSaveForm');
  // const LastName = ref<string>(data.name);
  emitter.on('handleSaveForm', async (params?) => {
    console.log('Save Attribute Form', data);
    // 校验表单
    const res = await validateAttrForm();

    if (res) {
      // 校验 options 字段
      // -- 不是由 blur 触发的保存事件
      if (params?.type != 'blur') {
        // 先获取当前 form 表单的值的 inputType 值
        const { type } = getFieldsValue();

        // 如果 type 不为 text 且 当前 type 不为 change
        // 才进行后续判断
        if (type != inputTypeEnum.TEXT && params?.type != 'change') {
          const { options } = data.value;
          if ((isShowEdit as any).value) {
            // console.log('1---', (isShowEdit as any).value);
            showDiscardModal.value = true; // 弹窗
            if (params?.type == 'tree') {
              emitter.emit('changeSelected', params.selectList);
            }
            return;
          } else if (options.length > 0) {
            // console.log('2---', options.length);
            showEditorRequired.value = false;
          } else {
            // console.log('3---', type, params?.type);
            // 如果长度为 0 则提示
            showEditorRequired.value = true; // 文字提示
            showDiscardModal.value = true; // 弹窗

            // 如果是点击树节点，需要防止树选中节点改变
            if (params?.type == 'tree') {
              emitter.emit('changeSelected', params.selectList);
            }
            return;
          }
        }
      }

      // 保存
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

      // 如果是 Go ，则前往 index
      if (params?.type == 'go') {
        props.handleAddIndex && props.handleAddIndex(params?.index);
      }

      // 如果是树形数据点击，则更新 indexList 值
      // -- 更新右侧数据
      if (params?.type == 'tree') {
        emits('changeIndexList', params.indexList);
      }

      // 如果是返回，则抛出 done
      if (params.type == 'back') {
        emits('done');
      }

      // 创建、保存
      if (params.type == 'create') {
        emits('createSave', params.data);
      }
    } else {
      showDiscardModal.value = true;
      if (params?.type != 'blur') {
        showDiscardModal.value = true; // 显示弹窗
      }
      // 防止树选中节点改变
      if (params?.type == 'tree') {
        emitter.emit('changeSelected', params.selectList);
      }
    }
  });

  onMounted(() => {
    setFieldsValue({
      ...data.value,
    });
    handleChangeType(data.value.type);
  });
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
