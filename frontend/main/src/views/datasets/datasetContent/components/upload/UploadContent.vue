<template>
  <div class="upload__content">
    <div class="upload__content--dragger">
      <UploadDragger :multiple="true" :showUploadList="false" :beforeUpload="beforeUpload">
        <Icon icon="ant-design:cloud-upload-outlined" size="50" color="#57CCEF" />
        <div class="dragger-placeholder">
          <span>{{ t('business.group.create.drop') }}</span>
          <span>{{ t('business.group.create.browse') }}</span>
        </div>
      </UploadDragger>
      <div class="dragger-tips">
        <Icon class="icon" icon="eva:info-fill" size="16" />
        <div class="text">
          <span>The total files size should be limit of 500 mb.For more details, get our </span>
          <a href="https://docs.basic.ai/docs/upload" target="_blank">
            open data or check documentation
          </a>
          <span>for supported 3D format and how to upload data with results.</span>
        </div>
      </div>
    </div>
    <Divider class="upload__content--divider">Or</Divider>
    <div class="upload__content--url">
      <div class="url-input mb-15px flex items-center gap-10px">
        <Form name="custom-validation" ref="formRef" :model="formState" :rules="rules">
          <Form.Item name="url" :colon="false" class="h-36px">
            <Input
              style="height: 36px"
              autocomplete="off"
              v-model:value="formState.url"
              allowClear
              type="input"
              placeholder="Input a url links your zip file"
            />
          </Form.Item>
        </Form>
        <Button
          type="primary"
          style="background: #60a9fe; border-radius: 8px"
          @click="handleSubmit"
          :loading="isLoading"
        >
          Upload data by URL
        </Button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { Form, Input, Upload, Divider } from 'ant-design-vue';
  import { Icon } from '/@/components/Icon';
  import { Button } from '/@@/Button';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { datasetTypeEnum, UploadSourceEnum } from '/@/api/business/model/datasetModel';
  import { validateUrl } from './formSchemas';

  const UploadDragger = Upload.Dragger;
  const { t } = useI18n();
  const { createMessage } = useMessage();

  const props = defineProps<{ id: number; datasetType: datasetTypeEnum | undefined }>();
  const emits = defineEmits(['closeUpload']);

  /** Upload */
  const beforeUpload = (file: File) => {
    const compressType = [
      'application/zip',
      'application/x-tar',
      'application/x-gzip',
      'application/x-bzip2',
      'application/x-zip-compressed',
    ];
    const imageType = ['image/jpeg', 'image/png'];

    if (props.datasetType == datasetTypeEnum.IMAGE) {
      const isImage = [...imageType, ...compressType].includes(file.type);
      if (!isImage) {
        return createMessage.error('You can only upload zip/gzip/tar/jpg/jpeg/png file!');
      }
    } else {
      const isCompress = compressType.includes(file.type);
      if (!isCompress) {
        return createMessage.error('You can only upload zip/gzip/tar file!');
      }
    }

    const isLimit = file.size / 1024 / 1024 < 500;
    if (!isLimit) {
      return createMessage.error('file must smaller than 500MB!');
    }

    emits('closeUpload', file, UploadSourceEnum.LOCAL);

    return false;
  };

  /** URL */
  const formRef = ref();
  const formState = reactive({
    url: '',
  });
  const rules = {
    url: [{ validator: validateUrl, trigger: 'change' }],
  };

  // Submit
  const isLoading = ref<boolean>(false);
  const handleSubmit = async () => {
    isLoading.value = true;
    setTimeout(() => {
      isLoading.value = false;
      emits('closeUpload', formState.url, UploadSourceEnum.URL);
    }, 1000);
  };
</script>
<style lang="less" scoped>
  .upload__content {
    padding: 40px 0;

    &--dragger {
      position: relative;
      margin-bottom: 20px;

      :deep(.ant-upload-drag) {
        width: 500px;
        height: 233px;
        padding: 40px;

        background: #f9fcff;
        border: 1px dashed #60a9fe;
        border-radius: 10px;

        .ant-upload-btn {
          padding: 0;

          .ant-upload-drag-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;

            .dragger-placeholder {
              margin-bottom: 15px;

              span {
                font-weight: 500;
                font-size: 16px;
                line-height: 19px;
                color: #333333;

                &:last-child {
                  color: #57ccef;
                }
              }
            }
          }
        }
      }

      .dragger-tips {
        position: absolute;
        display: flex;
        gap: 10px;
        // width: 388px;
        width: 420px;
        height: 60px;
        top: 133px;
        left: 50%;
        transform: translateX(-50%);

        .icon {
          position: relative;
          top: 3px;
          color: #57ccef;
        }

        .text {
          span {
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            color: #666666;

            &:nth-child(2) {
              color: #60a9fe;
              cursor: pointer;
            }
          }
        }
      }
    }

    &--divider {
      color: #e0e0e0;
      margin-bottom: 20px;

      :deep(.ant-divider-inner-text) {
        font-weight: 400;
        font-size: 14px;
        line-height: 16px;
        color: #666666;
      }
    }

    &--url {
      position: relative;

      :deep(.ant-form) {
        flex: 1;
        height: 36px;

        .ant-input {
          height: 22px;
        }
      }

      .url-input {
        display: flex;
        align-items: center;
        gap: 10px;

        input,
        button {
          height: 36px;
        }
      }

      .url-verify {
        position: absolute;
        top: 45px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 400;
        font-size: 14px;
        line-height: 16px;
      }
    }
  }
</style>
