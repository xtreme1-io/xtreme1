<template>
  <div class="upload__content">
    <div v-if="!uploading" class="upload__content--dragger">
      <Upload.Dragger :multiple="false" :showUploadList="false" :beforeUpload="beforeUpload">
        <SvgIcon size="60" name="upload" />
        <div class="dragger-placeholder">
          <span>{{ 'Click to select file or drag and drop file here' }}</span>
          <span>{{ 'Supported file type: xlsx' }}</span>
        </div>
      </Upload.Dragger>
    </div>
    <div class="upload__content--progress" v-else>
      <Spin />
      <span class="tip">Uploading...</span>
      <Button @click="handleCancel"> Cancel </Button>
    </div>
    <div class="upload__content--footer">
      <span @click="handleDownload">Download Excel Template</span>
      <span @click="handleView"> View Help Document</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
  // import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Upload, Spin } from 'ant-design-vue';
  import { SvgIcon } from '/@/components/Icon';
  import { Button } from '/@@/Button';
  import { ref } from 'vue';
  import { importClass } from '/@/api/business/ontology';
  import { useRoute } from 'vue-router';
  import { getBufferWithFile } from '/@/components/Upload/src/helper';
  const uploading = ref(false);
  const { query } = useRoute();
  const { id } = query;
  const props = defineProps<{
    type?: string;
  }>();
  const emits = defineEmits(['closeModal']);

  // const { t } = useI18n();
  const { createMessage } = useMessage();
  /** Upload */
  const beforeUpload = (_, fileList: File[]) => {
    const excelType = ['application/json'];

    const isExcel = fileList.every((file) => excelType.includes(file.type));
    if (!isExcel) {
      return createMessage.error('You can only upload json file!');
    }

    console.log('beforeUpload: ', fileList);
    // emits('closeUpload', fileList, CompressSourceType.LOCAL);
    uploading.value = true;
    const upload = async ({ file: resultImg }) => {
      try {
        const res: any = await importClass({
          data: {
            desId: id,
            desType: props.type || 'DATASET',
          },
          file: resultImg,
        });
        console.log('upload', res);
        emits('closeModal');
        uploading.value = false;
      } catch (_) {}
    };
    getBufferWithFile(fileList[0]).then(upload);
    return false;
  };

  const handleCancel = () => {};

  const handleDownload = () => {};
  const handleView = () => {};
</script>
<style lang="less" scoped>
  .upload__content {
    &--dragger {
      :deep(.ant-upload-drag) {
        width: 500px;
        height: 208px;

        background: #f9fcff;
        border: 1px dashed #60a9fe;
        border-radius: 10px;

        .ant-upload-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;

          .ant-upload-drag-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;

            .dragger-placeholder {
              padding: 0 160px;
              display: flex;
              flex-direction: column;
              gap: 15px;

              span {
                &:first-child {
                  font-weight: 500;
                  font-size: 16px;
                  line-height: 19px;
                  color: #333333;
                }

                &:last-child {
                  font-weight: 400;
                  font-size: 14px;
                  line-height: 20px;
                  color: #aaaaaa;
                }
              }
            }
          }
        }
      }
    }

    &--progress {
      width: 500px;
      height: 208px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 20px;

      background: #f9fcff;
      border: 1px dashed #60a9fe;
      border-radius: 10px;

      .tip {
        font-weight: 400;
        font-size: 16px;
        line-height: 19px;
        color: #333333;
      }
    }

    &--footer {
      width: 100%;
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      color: @primary-color;
      cursor: pointer;
    }
  }
</style>
