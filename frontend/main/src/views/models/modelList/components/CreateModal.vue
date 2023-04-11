<template>
  <BasicModal
    :visible="false"
    :okText="t('common.saveText')"
    v-bind="$attrs"
    @register="registerModal"
    destroyOnClose
    :width="660"
    :closable="false"
    :centered="true"
    wrapClassName="models__modal"
    @ok="handleOk"
  >
    <template #title> {{ t('business.models.list.create') }} </template>
    <div class="inner">
      <div class="text">
        <BasicForm @register="registerForm" :showActionButtonGroup="false" :hideRequiredMark="true">
          <template #description="{ model, field }">
            <FormItem
              label=""
              name="description"
              :labelCol="{ span: 0 }"
              :wrapperCol="{ span: 24 }"
            >
              <p> {{ t('business.models.description') }} </p>

              <Tinymce
                v-model="model.description"
                width="100%"
                :plugins="plugins"
                :toolbar="toolbar"
              />
            </FormItem>
          </template>
        </BasicForm>
      </div>
      <!-- <div class="btn">
        <Button type="primary" @click="closeModal">{{ t('common.okText') }}</Button>
      </div> -->
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { Tinymce } from '/@/components/Tinymce';
  import { BasicForm, useForm } from '/@/components/Form';
  import { Button, Radio, Form } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import warningSvg from '/@/assets/images/models/warning.svg';
  const { createMessage } = useMessage();
  import { createForm } from './formSchemas';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { ref } from 'vue';
  import { addModelApi } from '/@/api/business/models';
  import { useGo } from '/@/hooks/web/usePage';
  import { RouteChildEnum, RouteNameEnum } from '/@/enums/routeEnum';
  import { parseParam } from '/@/utils/business/parseParams';
  //表单
  const plugins = [
    'advlist anchor autolink autosave code codesample  directionality  fullscreen hr insertdatetime link lists media nonbreaking noneditable pagebreak paste preview print save searchreplace spellchecker tabfocus  template  textpattern visualblocks visualchars wordcount',
  ];
  const toolbar = [
    'fontsizeselect bold italic underline strikethrough alignleft aligncenter alignright outdent indent  blockquote undo redo',
  ];
  const FormItem = Form.Item;
  const [registerForm, { validate, resetFields, setFieldsValue }] = useForm({
    schemas: createForm,
    labelCol: { span: 4 },
    wrapperCol: { span: 18 },
    labelAlign: 'left',
  });

  defineExpose({
    setFieldsValue,
  });
  const go = useGo();
  const emit = defineEmits(['success']);
  const { t } = useI18n();
  const [registerModal, { closeModal: closeCreateModal, changeOkLoading }] = useModalInner();
  const handleOk = async () => {
    changeOkLoading(true);
    try {
      const data = await validate();

      let res = await addModelApi(data);
      emit('success');
      closeCreateModal();
      resetFields();
      changeOkLoading(false);
      createMessage.success(t('action.createSuccess'));

      if (window.opener && window.opener.reConnect) {
        let { resSetModelList } = window.opener?.reConnect;
        resSetModelList(res);
      } else {
        go(parseParam(RouteChildEnum.MODELS_DETAIL, { id: res?.id }));
      }
    } catch (e) {
      changeOkLoading(false);
    }
  };
</script>
<style lang="less" scoped>
  .inner {
    .text {
      width: 100%;
      display: flex;
      align-items: center;
      padding: 40px;

      font-weight: 500; //font-weight: 600;

      font-size: 16px;
      color: #333;
    }

    .btn {
      position: relative;
      top: -25px;
      left: -10px;
      text-align: right;

      button {
        width: 51px;
        height: 36px;
        border-radius: 6px;
      }
    }
  }
</style>

<style lang="less">
  .models__modal {
    .scrollbar__view > div {
      overflow: auto;
    }
    .scrollbar__wrap {
      // overflow: auto;
    }

    .scrollbar__bar {
      display: none;
    }

    .ant-modal-body {
      // height: 150px;
      // overflow: auto;
    }
  }
</style>
