<template>
  <div class="upload__content">
    <div v-if="!uploading" class="upload__content--dragger">
      <Upload.Dragger :multiple="false" :showUploadList="false" :beforeUpload="beforeUpload">
        <SvgIcon size="60" name="upload" />
        <div class="dragger-placeholder">
          <span>{{ 'Click to select file or drag and drop file here' }}</span>
          <span>{{ 'Supported file type: json' }}</span>
        </div>
      </Upload.Dragger>
    </div>
    <div class="upload__content--progress" v-else>
      <Spin />
      <span class="tip">Uploading...</span>
      <Button @click="handleCancel"> Cancel </Button>
    </div>
    <ConflictModal @register="registerConflictModal" @back="handleBack" @confirm="handleConfirm" />
    <div class="upload__content--footer">
      <span @click="handleDownload">Download Json Template</span>
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
  import { importClass, mergeClass } from '/@/api/business/ontology';
  import { useRoute } from 'vue-router';
  import { getBufferWithFile } from '/@/components/Upload/src/helper';
  import ConflictModal from '../copy-modal/ConflictModal.vue';
  import { useModal } from '/@/components/Modal';
  import { ICopyEnum } from '../copy-modal/data';
  import { downloadByUrl } from '/@/utils/file/download';
  import { openWindow } from '/@/utils';
  const [registerConflictModal, { openModal: openConflictModal, closeModal: closeConflictModal }] =
    useModal();
  const uploading = ref(false);
  const { query } = useRoute();
  const { id } = query;
  const props = defineProps<{
    type?: string;
  }>();
  const emits = defineEmits(['callback', 'close']);
  const data = ref();
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
        if (res.data.isDuplicate === true) {
          data.value = res.data;
          openConflictModal(true, {
            type: ICopyEnum.CLASSES,
            conflictClassList: res.data.classes.filter((item) =>
              res.data.duplicateClassName.map((r) => r.name).includes(item.name),
            ),
            conflictClassificationList: res.data.classifications?.filter((item) =>
              res.data.duplicateClassificationName.includes(item.name),
            ),
          });
          // emits('close');
        } else {
          emits('callback', 'success', {
            validClassSize: res.data.validClassSize,
            validClassificationSize: res.data.validClassificationSize,
            classTotalSize: res.data.classTotalSize,
            classificationTotalSize: res.data.classificationTotalSize,
          });
        }

        uploading.value = false;
      } catch (_) {
        console.log(_);
        emits('callback', 'error');
      }
    };
    getBufferWithFile(fileList[0]).then(upload);
    return false;
  };

  const handleCancel = () => {};

  const handleDownload = () => {
    downloadByUrl({
      url: 'https://basicai-asset.s3.us-west-2.amazonaws.com/xtreme1/class-and-classification-template.json',
    });
  };
  const handleView = () => {
    openWindow(
      'https://docs.xtreme1.io/xtreme1-docs/product-guides/ontology/import-class-classification',
    );
  };

  const handleBack = () => {};

  const handleConfirm = async (classList: any[] = [], classificationList: any[] = []) => {
    // console.log(classList, classificationList);
    let classes;
    let classifications;
    if (
      data.value.duplicateClassName !== null &&
      classList.length !== data.value.duplicateClassName?.length
    ) {
      const list = data.value.duplicateClassName.filter(
        (item) => !classList.map((record) => record.name).includes(item.name),
      );
      classes = data.value.classes.filter((k) => !list.includes(k.name));
    }
    if (
      data.value.duplicateClassificationName !== null &&
      classificationList.length !== data.value.duplicateClassificationName?.length
    ) {
      const list = data.value.duplicateClassificationName.filter(
        (item) => !classificationList.map((record) => record.name).includes(item),
      );
      classifications = data.value.classifications.filter((k) => !list.includes(k.name));
    }
    await mergeClass({
      ...data.value,
      classes,
      classifications,
    });
    emits('close');
  };
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
