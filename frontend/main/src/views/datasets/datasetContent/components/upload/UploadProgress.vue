<template>
  <div class="upload-list">
    <div v-for="item in fileList" :key="item.uuid" class="item">
      <div class="w-28px">
        <SvgIcon size="28" name="file" />
      </div>
      <div class="w-432px flex flex-col gap-10px">
        <div class="flex justify-between items-center h-24px">
          <div class="item-name">{{ item.name }}</div>
          <Icon
            class="cursor-pointer"
            icon="clarity:close-line"
            color="#aaa"
            @click="handleCancelUpload(item)"
          />
        </div>
        <div class="flex items-center gap-10px h-16px">
          <Progress
            class="flex-1"
            :strokeColor="item.status != UploadResultStatus.ERROR ? '#60A9FE' : '#F8827B'"
            :percent="getProgress(item)"
            :strokeWidth="10"
            :showInfo="false"
            trailColor="#F3F3F3"
          />
          <div
            class="item-status"
            :style="{ color: item.status == UploadResultStatus.ERROR ? '#F8827B' : '#999999' }"
          >
            {{ item.status }}
          </div>
          <div class="item-value">
            <span v-if="item.status != UploadResultStatus.ERROR">{{ getProgress(item) }}%</span>
          </div>
        </div>
        <div v-if="item.status == UploadResultStatus.ERROR" class="item-error">
          {{ item.error }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, watch } from 'vue';
  // import { useI18n } from '/@/hooks/web/useI18n';
  import axios from 'axios';
  import { Progress } from 'ant-design-vue';
  import Icon, { SvgIcon } from '/@/components/Icon';
  import { FileItem } from './uploadTyping';
  import { UploadResultStatus } from '/@/components/Upload/src/typing';
  import {
    generatePresignedUrl,
    uploadDatasetApi,
    findUploadRecordBySerialNumbers,
  } from '/@/api/business/dataset';
  import {
    datasetTypeEnum,
    UploadParams,
    UploadSourceEnum,
    UploadStatusEnum,
  } from '/@/api/business/model/datasetModel';

  // const { t } = useI18n();
  const props = defineProps<{
    id: number | string;
    datasetType: datasetTypeEnum | undefined;
    file: any[];
    source: UploadSourceEnum;
    uploadUrl: string;
    modelId?: number;
    resultType?: string;
    dataFormat?: string;
  }>();
  const emits = defineEmits(['fetchList']);

  /** Progress */
  const uploadProgress = ref<any[]>([]);
  const setProgress = (e, fileItem) => {
    const temp = uploadProgress.value.filter((item) => item.uuid === fileItem.uuid);
    if (temp.length > 0) {
      temp[0].percent = parseInt((e.loaded / e.total) * 60);
    } else {
      uploadProgress.value.push({
        uuid: fileItem.uuid,
        percent: parseInt((e.loaded / e.total) * 60),
      });
    }
  };
  const getProgress = (item) => {
    const res = uploadProgress.value.filter((record) => record.uuid === item.uuid);
    return res?.[0]?.percent ?? 0;
  };

  /** Get FileList */
  const fileList = ref<FileItem[]>([]);
  watch(
    fileList,
    (list) => {
      if (!isUploading.value) {
        isUploading.value = true;
        if (props.source == UploadSourceEnum.LOCAL) {
          handleUploadLocal(list);
        } else {
          handleUploadUrl(list);
        }
      }
    },
    { deep: true },
  );
  watch(
    () => props.file,
    () => {
      props.file.forEach((item) => {
        getUploadList(item);
      });
    },
    { deep: true },
  );
  const getUploadList = (data) => {
    const list = [
      {
        file: data,
        status: UploadResultStatus.PENDING,
        name: data.name,
        size: data.size,
        type: data.type,
        percent: 0,
        uuid: data.uid,
      },
    ];
    fileList.value = unref(fileList).concat(list as any);
  };
  watch(
    () => props.uploadUrl,
    () => {
      const urlFileNameRegEx = /(?<=\/)[^\/\?#]+(?=[^\/]*$)/;
      const list = [
        {
          status: UploadResultStatus.PENDING,
          name: urlFileNameRegEx.exec(props.uploadUrl)?.[0] ?? 'noName',
          uuid: String(Math.random()).slice(0, 10),
        },
      ];
      fileList.value = unref(fileList).concat(list as any);
    },
  );
  const reset = () => {
    fileList.value.forEach((item) => {
      item?.controller?.abort();
    });
    fileList.value = [];
    clearInterval(processTimer.value);
  };

  /** Cancel Upload */
  const handleCancelUpload = (item: FileItem) => {
    console.log(item.status);
    // processing can't cancel request
    if (item.status == UploadResultStatus.UPLOADING) {
      if (isUploading.value) {
        item?.controller?.abort();
      }
    } else if (item.status == UploadResultStatus.PENDING) {
      item.status = UploadResultStatus.CANCELED;
    }
  };

  /** Upload Start */
  const processTimer = ref();
  const isUploading = ref<boolean>(false);
  /** Local */
  const handleUploadLocal = async (list) => {
    const uploadFileList =
      list.filter(
        (item) =>
          item.status !== UploadResultStatus.SUCCESS &&
          item.status !== UploadResultStatus.SUCCESS_WITH_ERROR &&
          item.status !== UploadResultStatus.ERROR &&
          item.status !== UploadResultStatus.CANCELED,
      ) ?? [];

    if (uploadFileList.length > 0) {
      const fileItem: FileItem = uploadFileList[0];
      if (!fileItem) return;

      const upload = async ({ file: resultImg }) => {
        try {
          const result = await generatePresignedUrl({
            fileName: resultImg.name,
            datasetId: props.id as string,
          });

          fileItem.status = UploadResultStatus.UPLOADING;
          // cancel request
          fileItem.controller = new AbortController();
          try {
            await axios({
              method: 'put',
              url: result.presignedUrl,
              data: resultImg,
              onUploadProgress: (e) => {
                setProgress(e, fileItem);
              },
              signal: fileItem.controller.signal,
            });
            fileItem.status = UploadResultStatus.PROCESSING;
            const temp = uploadProgress.value.filter((item) => item.uuid === fileItem.uuid);

            try {
              const uploadParams: UploadParams = {
                fileUrl: result.accessUrl,
                datasetId: props.id as string,
                source: props.source,
                resultType: props.resultType as string,
                modelId: props.modelId as number,
                dataFormat: props.dataFormat as string,
              };

              const serialNumbers = await uploadDatasetApi(
                uploadParams,
                fileItem.controller.signal,
              );
              const uploadStatus = ref<UploadStatusEnum>(UploadStatusEnum.DOWNLOADING);
              const findUploadRecord = async () => {
                try {
                  const record = await findUploadRecordBySerialNumbers(
                    serialNumbers,
                    fileItem.controller.signal,
                  );
                  const {
                    status,
                    errorMessage,
                    downloadedFileSize,
                    totalFileSize,
                    parsedDataNum,
                    totalDataNum,
                  } = record[0];

                  if (status == UploadStatusEnum.FAILED) {
                    throw new Error(errorMessage as string);
                  }
                  uploadStatus.value = status;

                  const downloadPercent =
                    parseInt((Number(downloadedFileSize ?? 0) / Number(totalFileSize ?? 1)) * 20) ||
                    0;
                  const parsedPercent =
                    parseInt((Number(parsedDataNum ?? 0) / Number(totalDataNum ?? 1)) * 20) || 0;

                  temp[0].percent = 60 + downloadPercent + parsedPercent;
                  console.log(status, '==>', downloadPercent, '==', parsedPercent);

                  if (uploadStatus.value == UploadStatusEnum.PARSE_COMPLETED) {
                    clearInterval(processTimer.value);
                    temp[0].percent = 100;
                    fileItem.status = errorMessage
                      ? UploadResultStatus.SUCCESS_WITH_ERROR
                      : UploadResultStatus.SUCCESS;
                    isUploading.value = false;
                    emits('fetchList');
                  }
                } catch (e: any) {
                  clearInterval(processTimer.value);
                  if (e.message == 'canceled') {
                    fileItem.status = UploadResultStatus.CANCELED;
                    fileItem.error = String(e.message);
                  } else {
                    fileItem.status = UploadResultStatus.ERROR;
                    fileItem.error = String(e);
                  }
                  isUploading.value = false;
                }
              };
              findUploadRecord();
              processTimer.value = setInterval(async () => {
                await findUploadRecord();
              }, 3000);
            } catch (e: any) {
              if (e.message == 'canceled') {
                fileItem.status = UploadResultStatus.CANCELED;
                fileItem.error = String(e.message);
              } else {
                fileItem.status = UploadResultStatus.ERROR;
                fileItem.error = String(e);
              }
              isUploading.value = false;
            }
          } catch (e: any) {
            if (e.message == 'canceled') {
              fileItem.status = UploadResultStatus.CANCELED;
              fileItem.error = String(e.message);
            } else {
              fileItem.status = UploadResultStatus.ERROR;
              fileItem.error = String(e);
            }
            isUploading.value = false;
          }
        } catch (e) {
          fileItem.status = UploadResultStatus.ERROR;
          fileItem.error = String(e);
          isUploading.value = false;
        }
      };
      upload(fileItem);
    } else {
      isUploading.value = false;
    }
  };
  /** Url */
  const handleUploadUrl = async (list) => {
    const uploadFileList =
      list.filter(
        (item) =>
          item.status !== UploadResultStatus.SUCCESS &&
          item.status !== UploadResultStatus.SUCCESS_WITH_ERROR &&
          item.status !== UploadResultStatus.ERROR &&
          item.status !== UploadResultStatus.CANCELED,
      ) ?? [];
    const fileItem: FileItem = uploadFileList[0];

    if (!fileItem) return;

    fileItem.status = UploadResultStatus.UPLOADING;
    uploadProgress.value.push({
      uuid: fileItem.uuid,
      percent: 0,
    });
    const temp = uploadProgress.value.filter((item) => item.uuid === fileItem.uuid);
    temp[0].percent = 0;
    setTimeout(async () => {
      fileItem.status = UploadResultStatus.PROCESSING;
      temp[0].percent = 60;

      try {
        // cancel request
        fileItem.controller = new AbortController();
        const uploadParams: UploadParams = {
          fileUrl: props.uploadUrl,
          datasetId: props.id as string,
          source: props.source,
          resultType: props.resultType as string,
          modelId: props.modelId as number,
          dataFormat: props.dataFormat as string,
        };
        // get serialNumbers
        const serialNumbers = await uploadDatasetApi(uploadParams, fileItem.controller.signal);
        const uploadStatus = ref<UploadStatusEnum>(UploadStatusEnum.DOWNLOADING);
        const findUploadRecord = async () => {
          try {
            const record = await findUploadRecordBySerialNumbers(
              serialNumbers,
              fileItem.controller.signal,
            );
            const {
              status,
              errorMessage,
              downloadedFileSize,
              totalFileSize,
              parsedDataNum,
              totalDataNum,
            } = record[0];

            if (status == UploadStatusEnum.FAILED) {
              throw new Error(errorMessage as string);
            }
            uploadStatus.value = status;

            const downloadPercent =
              parseInt((Number(downloadedFileSize ?? 0) / Number(totalFileSize ?? 1)) * 20) || 0;
            const parsedPercent =
              parseInt((Number(parsedDataNum ?? 0) / Number(totalDataNum ?? 1)) * 20) || 0;

            temp[0].percent = 60 + downloadPercent + parsedPercent;
            console.log(status, '==>', downloadPercent, '==', parsedPercent);

            if (uploadStatus.value == UploadStatusEnum.PARSE_COMPLETED) {
              clearInterval(processTimer.value);
              temp[0].percent = 100;
              fileItem.status = errorMessage
                ? UploadResultStatus.SUCCESS_WITH_ERROR
                : UploadResultStatus.SUCCESS;
              isUploading.value = false;
              emits('fetchList');
            }
          } catch (e: any) {
            clearInterval(processTimer.value);
            if (e.message == 'canceled') {
              fileItem.status = UploadResultStatus.CANCELED;
              fileItem.error = String(e.message);
            } else {
              fileItem.status = UploadResultStatus.ERROR;
              fileItem.error = String(e);
            }
            isUploading.value = false;
          }
        };
        findUploadRecord();
        processTimer.value = setInterval(async () => {
          await findUploadRecord();
        }, 3000);
      } catch (e: any) {
        if (e.message == 'canceled') {
          fileItem.status = UploadResultStatus.CANCELED;
          fileItem.error = String(e.message);
        } else {
          fileItem.status = UploadResultStatus.ERROR;
          fileItem.error = String(e);
        }
        isUploading.value = false;
      }
    }, 500);
  };
  /** Upload End */

  defineExpose({
    fileList,
    reset,
  });
</script>
<style lang="less" scoped>
  .upload-list {
    padding: 40px 0;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .item {
      display: flex;
      padding: 15px;
      gap: 10px;

      width: 500px;

      border-radius: 8px;
      border: 1px solid #e0e0e0;

      .item-name {
        font-size: 14px;
        color: #333333;

        max-width: 80%;
        white-space: nowrap;
        overflow-x: hidden;
        text-overflow: ellipsis;
      }

      .item-status {
        width: 66px;
        font-size: 12px;
        line-height: 14px;
        color: #999;
      }

      .item-value {
        width: 38px;
        font-size: 14px;
        line-height: 16px;
        color: #666;
      }

      .item-error {
        font-size: 14px;
        line-height: 16px;
        color: #f8827b;
      }
    }
  }
</style>
