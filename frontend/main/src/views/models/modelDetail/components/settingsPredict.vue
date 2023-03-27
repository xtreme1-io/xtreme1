<template>
  <div class="title">
    <SvgIcon :name="overviewData.url ? 'sucess' : 'error'" />
    {{ t('business.models.settingsModel.Predict') }}
    <div style="float: right">
      <template v-if="!isEdit">
        <SvgIcon
          style="color: #c4c4c4; cursor: pointer; border-radius: 6px; border: 2px solid #aaa"
          size="26"
          @click="handleEdit"
          name="edit"
        />
      </template>
      <template v-else>
        <Button type="default" @click="handleCancel">{{ t('common.cancelText') }}</Button>
        <Button
          :title="!hasConnection ? 'Please test connection first' : ''"
          :disabled="!hasConnection"
          type="primary"
          class="ml-2"
          @click="handleSave"
          >{{ t('common.saveText') }}</Button
        >
      </template>
    </div></div
  >
  <div class="content">
    <a class="cursor-pointer link">
      <Icon
        size="18"
        style="color: #60a9fe; margin-right: 10px"
        class="info-icon"
        icon="material-symbols:library-books-rounded"
      />
      <span style="color: #8bc1e8">{{ t('business.models.helpLinkText.settingsPredict') }} </span>
    </a>

    <div class="predict">
      <span class="tab">URL:</span>
      <div>
        <Select :disabled="!isEdit" style="width: 120px" v-model:value="urlType">
          <Select.Option v-for="item in urlTypeList" :key="item" :value="item">
            {{ item }}
          </Select.Option>
        </Select>
      </div>
      <Input :disabled="!isEdit" v-model:value="urlVal" />
      <Button style="border-radius: 8px" type="default" @click="testConnection">{{
        t('business.models.settingsModel.TestConnection')
      }}</Button>
    </div>
    <div class="status"> <span class="tab">Status:</span>{{ connectionRes.status }}</div>
    <div class="response flex">
      <div class="tab">Response: </div
      ><div style="width: 90%"
        ><div v-if="connectionRes.errorMessage" class="errorMessage">
          <Alert :message="connectionRes.errorMessage" type="error" closable /> </div
        ><div v-if="connectionRes.content" class="content">
          <json-viewer :value="connectionRes.content" expand-depth="3" copyable boxed sort />
          <!-- <Alert :message="connectionRes.content" type="success" /> -->
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { useI18n } from '/@/hooks/web/useI18n';
  import Icon, { SvgIcon } from '/@/components/Icon';
  import { Tinymce } from '/@/components/Tinymce';
  import { computed, inject, reactive, ref, watch } from 'vue';
  import { editModelApi, testModelUrlConnectionApi } from '/@/api/business/models';
  import { Button, Input, message, Select, Alert } from 'ant-design-vue';
  import { useRoute } from 'vue-router';

  const isEdit = ref(false);
  const { t } = useI18n();

  const handleEdit = () => {
    isEdit.value = true;
    hasConnection.value = false;
  };
  const handleCancel = () => {
    urlVal.value = overviewData.url;
    isEdit.value = !isEdit.value;
  };

  let urlVal = ref<string>('');

  let urlTypeList = ref(['POST']);
  let urlType = ref('POST');
  const refreshListFn: Function | undefined = inject('refreshList');
  let overviewData: any = inject('overviewData');

  watch(
    () => overviewData,
    (val) => {
      urlVal.value = val.url;
    },
    {
      immediate: true,
      deep: true,
    },
  );
  watch(
    () => urlVal,
    () => {
      hasConnection.value = false;
    },
    {
      deep: true,
    },
  );

  const route = useRoute();
  const modelId = String(route?.query?.id);
  const handleSave = async () => {
    const reg = /(http|https):\/\/([\w.]+\/?)\S*/;
    let val = urlVal.value;
    if (!reg.test(val) || !val) {
      message.warning(t('business.models.settingsModel.TestConnectionUrlErrorMsg'));
      return;
    }
    const params = {
      id: Number(modelId),
      url: urlVal.value,
    };
    await editModelApi(params);
    refreshListFn && refreshListFn();
    isEdit.value = false;

    message.success('Successed');
    // handleSuccess();
  };
  let connectionRes = reactive({ status: null, errorMessage: '', content: '' });
  let hasConnection = ref<boolean>(false);
  const testConnection = async () => {
    const reg = /(http|https):\/\/([\w.]+\/?)\S*/;
    let val = urlVal.value;
    if (!reg.test(val) || !val) {
      message.warning(t('business.models.settingsModel.TestConnectionUrlErrorMsg'));
      return;
    }
    let res: any = await testModelUrlConnectionApi({ modelId: Number(modelId), url: urlVal.value });
    let { code, content, errorMessage, status } = res;

    if (code === 'OK') {
      hasConnection.value = true;
    }
    connectionRes.status = status;
    connectionRes.errorMessage = errorMessage;
    connectionRes.content = content;
  };
</script>
<style lang="less" scoped>
  .overview {
    & > div {
      margin-right: 80px;
      margin-bottom: 30px;
      overflow: hidden;

      &:last-child {
        margin-bottom: 0;
      }

      .title {
        height: 25px;
        line-height: 25px;
        font-size: 18px;
        color: #000;
      }
      .content {
        border-radius: 10px;
        .link {
          margin: 10px 0 20px 0;
          display: inline-block;
          padding: 3px 4px;
          background: #edf0ff;
          border-radius: 4px;
          span {
            font-size: 12px;
          }
        }
        .tab {
          display: inline-block;
          width: 100px;
        }
        .predict {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          input {
            flex: 1;
            margin: 0 20px;
            height: 32px;
          }
        }
        .status {
          margin-bottom: 20px;
        }
        .response {
        }
      }
    }

    .des_text {
      // font-size: 14px;
      // line-height: 32px;
      // color: #333;
      // word-break: break-word;

      // width: 90%;
      margin-left: 20px;
      margin-bottom: 10px;
      padding: 20px;
      padding-right: 50px;
      background: #e6f7fd;
      border-radius: 20px;
    }
  }
</style>
