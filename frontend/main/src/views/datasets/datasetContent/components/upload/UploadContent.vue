<template>
  <div class="upload__content">
    <!-- 拖拽上传 -->
    <div class="upload__content--dragger">
      <UploadDragger :multiple="true" :showUploadList="false" :beforeUpload="beforeUpload">
        <!-- 上传框内部内容 -->
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
          <span>open data or check documentation </span>
          <span>for supported 3D format and how to upload data with results.</span>
        </div>
      </div>
    </div>
    <!-- 分割线 -->
    <Divider class="upload__content--divider">Or</Divider>
    <!-- URL上传 -->
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
        <!-- <Input class="flex-1 h-36px" autocomplete="off" v-model:value="path" @blur="handleBlur" /> -->
        <Button
          type="primary"
          style="background: #60a9fe; border-radius: 8px"
          @click="handleSubmit"
          :loading="isLoading"
        >
          Upload data by URL
        </Button>
      </div>
      <!-- <div v-if="showValid" class="url-verify animate-fadeIn animate-animated">
        <Icon
          class="transform rotate-180 translate-y-1px mr-5px"
          icon="carbon:warning-filled"
          :color="isValid ? '#7FF0B3' : '#F8827B'"
          rotate="180deg"
        />
        <span :style="{ color: isValid ? '#7FF0B3' : '#F8827B' }">{{ showInvalidText }}</span>
      </div> -->
    </div>
    <!-- ProgressModal -->
    <!-- <ProgressModal
      @register="registerProgressModal"
      :datasetType="props.datasetType"
      :id="props.id"
    /> -->
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { Form, Input, Upload, Divider } from 'ant-design-vue';
  import { Icon } from '/@/components/Icon';
  import { Button } from '/@@/Button';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  // import { useModal } from '/@/components/Modal';
  import { datasetTypeEnum, UploadSourceEnum } from '/@/api/business/model/datasetModel';
  // import { verifyCompress, verifyImage } from './utils';
  import { validateUrl } from './formSchemas';
  // import ProgressModal from './ProgressModal.vue';

  const UploadDragger = Upload.Dragger;
  const { t } = useI18n();
  const { createMessage } = useMessage();

  const props = defineProps<{ id: number; datasetType: datasetTypeEnum | undefined }>();
  const emits = defineEmits(['closeUpload']);
  // const [registerProgressModal, { openModal: openProgressModal }] = useModal();

  /** Upload */
  // const fileList = ref<any[]>([]);
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
        // TODO 提示文案
        return createMessage.error('You can only upload zip/gzip/tar/jpg/jpeg/png file!');
      }
    } else {
      const isCompress = compressType.includes(file.type);
      if (!isCompress) {
        // TODO 提示文案
        return createMessage.error('You can only upload zip/gzip/tar file!');
      }
    }

    const isLimit = file.size / 1024 / 1024 < 500;
    if (!isLimit) {
      // TODO 提示文案
      return createMessage.error('file must smaller than 500MB!');
    }

    // fileList.value.push(file);
    console.log(file);
    emits('closeUpload', file, UploadSourceEnum.LOCAL);
    // openProgressModal(true, { file: fileList.value });

    return false;
  };

  /** URL */

  // 表单
  const formRef = ref();
  const formState = reactive({
    url: '',
  });
  const rules = {
    url: [
      { validator: validateUrl, trigger: 'change' },
      // { max: 255, message: t('business.ontology.maxLength') },
    ],
  };

  // const path = ref<string>('');
  // const showValid = ref<boolean>(false);
  // // blur 时开启 校验文字
  // const handleBlur = () => {
  //   showValid.value = true;
  // };
  // // 是否合法
  // const isValid = computed<boolean>(() => {
  //   return verifyCompress(path.value);
  // });
  // // 显示校验文字
  // const showInvalidText = computed<string>(() => {
  //   let str = '';

  //   if (isValid.value) {
  //     str = t('business.datasetContent.uploadModel.validUrl');
  //   } else if (verifyImage(path.value)) {
  //     str =
  //       t('business.datasetContent.uploadModel.invalidUrl') +
  //       t('business.datasetContent.uploadModel.supported');
  //   } else {
  //     str = t('business.datasetContent.uploadModel.invalidUrl');
  //   }

  //   return str;
  // });

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
