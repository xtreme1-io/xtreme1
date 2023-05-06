<template>
  <div class="upload__content">
    <div class="flex items-center gap-10px mb-15px">
      <div class="whitespace-nowrap" style="color: #333; width: 100px">Data Format</div>
      <Select v-model:value="dataFormat" style="width: 240px" allowClear>
        <Select.Option v-for="item in dataFormatOption" :key="item.value" :value="item.value">
          {{ item.label }}
        </Select.Option>
      </Select>
    </div>
    <div class="custom-item mb-15px" v-if="datasetType !== datasetTypeEnum.TEXT">
      <Checkbox v-model:checked="containsAnnotationResult">Contains annotation result</Checkbox>
    </div>
    <div v-if="containsAnnotationResult" class="flex items-center gap-10px mb-15px">
      <div class="whitespace-nowrap" style="color: #333; width: 100px">Result Type</div>
      <Select
        placeholder="please select"
        v-model:value="resultType"
        style="width: 240px"
        allowClear
      >
        <Select.Option v-for="item in resultTypeOption" :key="item.value" :value="item.value">
          {{ item.label }}
        </Select.Option>
      </Select>
    </div>
    <div
      v-if="!!containsAnnotationResult && resultType === 'MODEL_RUN'"
      class="flex items-center gap-10px mb-15px"
    >
      <div class="whitespace-nowrap" style="color: #333; width: 100px">Model Name</div>
      <Select placeholder="please select" style="width: 240px" size="small" v-model:value="modelId">
        <Select.Option v-for="item in modelRunsList" :key="item.value" :value="item.value">
          {{ item.label }}
        </Select.Option>
      </Select>
      <a @click="CreatModel"> Create a model </a>
    </div>

    <div class="upload__content--dragger">
      <div class="dragger-tips">
        <Icon class="icon" icon="eva:info-fill" size="24" />
        <div class="text">
          <span>Get our </span>
          <a
            class="highlight"
            href="https://docs.xtreme1.io/xtreme1-docs/product-guides/upload-dataset"
            target="_blank"
          >
            open data or check documentations
          </a>
          <span> for data formats and upload guides.</span>
        </div>
      </div>
      <UploadDragger :multiple="true" :showUploadList="false" :beforeUpload="beforeUpload">
        <SvgIcon size="60" name="upload" />
        <div class="dragger-placeholder">
          <span>{{ t('business.group.create.drop') }}</span>
          <span>{{ t('business.group.create.browse') }}</span>
        </div>
      </UploadDragger>
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
  import { ref, reactive, onMounted, computed } from 'vue';
  import { Form, Input, Upload, Divider, Select, Checkbox } from 'ant-design-vue';
  import { Icon, SvgIcon } from '/@/components/Icon';
  import { Button } from '/@@/Button';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { datasetTypeEnum, UploadSourceEnum } from '/@/api/business/model/datasetModel';
  import { validateUrl } from './formSchemas';
  import { useRouter } from 'vue-router';
  import { RouteNameEnum } from '/@/enums/routeEnum';
  import { getModelPageApi } from '/@/api/business/models';

  const router = useRouter();

  let dataFormatOption = computed(() => {
    return props.datasetType?.includes('LIDAR') || props.datasetType?.includes('TEXT')
      ? [
          {
            value: 'XTREME1',
            label: 'Xtreme1',
          },
        ]
      : [
          {
            value: 'XTREME1',
            label: 'Xtreme1',
          },
          {
            value: 'COCO',
            label: 'COCO',
          },
        ];
  });
  const resultTypeOption = [
    {
      value: 'GROUND_TRUTH',
      label: 'Ground Truth',
    },
    {
      value: 'MODEL_RUN',
      label: 'Model Runs',
    },
  ];
  let modelRunsList = ref<any>([]);

  const getmodelRunsList = async () => {
    // LIDAR_FUSION
    let datasetType = props.datasetType?.includes('LIDAR')
      ? datasetTypeEnum.LIDAR
      : datasetTypeEnum.IMAGE;

    const params = { datasetType: datasetType };
    const res: any = await getModelPageApi({
      pageNo: 1,
      pageSize: 9999,
      ...params,
    });
    modelRunsList.value = res.list.map((item) => ({ label: item.name, value: item.id }));

    return { code: 200 };
  };
  let dataFormat = ref<string>('XTREME1');
  let resultType = ref<string | undefined>(undefined);
  let modelId = ref<number | undefined>(undefined);
  let containsAnnotationResult = ref<boolean>(false);
  const resSetModelList = async (res) => {
    let result = await getmodelRunsList();
    if (result.code === 200) {
      modelId.value = res?.id;
    }
  };
  const CreatModel = () => {
    (window as any).reConnect = { datasetType: props.datasetType, resSetModelList };
    let url = router.resolve({
      name: RouteNameEnum.MODEL_LIST,
      // query,
      // params,
    });
    window.open(url.href);
  };

  const UploadDragger = Upload.Dragger;
  const { t } = useI18n();
  const { createMessage } = useMessage();

  const props = defineProps<{ id: number; datasetType: datasetTypeEnum | undefined }>();
  const emits = defineEmits(['closeUpload']);

  /** Upload */
  const beforeUpload = (_, fileList: File[]) => {
    const compressType = [
      'application/zip',
      'application/x-tar',
      'application/x-gzip',
      'application/x-bzip2',
      'application/x-zip-compressed',
    ];
    const imageType = ['image/jpeg', 'image/png'];

    if (props.datasetType == datasetTypeEnum.IMAGE) {
      const isImage = fileList.every((file) => [...imageType, ...compressType].includes(file.type));
      if (!isImage) {
        return createMessage.error('You can only upload zip/gzip/tar/jpg/jpeg/png file!');
      }
    } else {
      const isCompress = fileList.every((file) => compressType.includes(file.type));
      if (!isCompress) {
        return createMessage.error('You can only upload zip/gzip/tar file!');
      }
    }

    // const totalSize = fileList.reduce(
    //   (previousValue, currenValue) => previousValue + currenValue.size,
    //   0,
    // );
    // const isLimit = totalSize / 1024 / 1024 < 500;
    // if (!isLimit) {
    //   return createMessage.error('file must smaller than 500MB!');
    // }
    emits('closeUpload', fileList, {
      source: UploadSourceEnum.LOCAL,
      resultType: resultType.value,
      modelId: modelId.value,
      dataFormat: dataFormat.value,
    });
    // console.log(modelId.value)
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
    try {
      await formRef.value.validate();

      isLoading.value = true;
      setTimeout(() => {
        isLoading.value = false;
        emits('closeUpload', formState.url, {
          source: UploadSourceEnum.URL,
          resultType: resultType.value,
          modelId: modelId.value,
          dataFormat: dataFormat.value,
        });
      }, 1000);
    } catch {}
  };

  // 页面加载
  onMounted(() => {
    getmodelRunsList();
  });
</script>
<style lang="less" scoped>
  .upload__content {
    padding: 20px 0;

    &--dragger {
      margin-bottom: 20px;

      .dragger-tips {
        margin-bottom: 22px;
        display: flex;
        align-items: center;
        gap: 10px;
        height: 24px;

        .icon {
          // position: relative;
          // top: 3px;
          color: #57ccef;
        }

        .text {
          font-weight: 400;
          font-size: 12px;
          line-height: 20px;
          color: #666666;
          .highlight {
            color: #60a9fe;
            cursor: pointer;
            &:hover {
              color: #60a9fe;
            }
          }
        }
      }

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
              span {
                font-weight: 500;
                font-size: 16px;
                line-height: 19px;
                color: #333333;

                &:last-child {
                  color: #60a9fe;
                }
              }
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
