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
  import { getBufferWithFile } from '/@/components/Upload/src/helper';
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
  }>();
  const emits = defineEmits(['fetchList']);

  /** Progress */
  // 进度值数组
  const uploadProgress = ref<any[]>([]);
  // 设置进度
  const setProgress = (e, fileItem) => {
    const temp = uploadProgress.value.filter((item) => item.uuid === fileItem.uuid);
    if (temp.length > 0) {
      temp[0].percent = parseInt((e.loaded / e.total) * 100);
    } else {
      uploadProgress.value.push({
        uuid: fileItem.uuid,
        percent: parseInt((e.loaded / e.total) * 100),
      });
    }
  };
  // 获取进度
  const getProgress = (item) => {
    const res = uploadProgress.value.filter((record) => record.uuid === item.uuid);
    return res?.[0]?.percent ?? 0;
  };

  /** Get FileList */
  const fileList = ref<FileItem[]>([]);
  watch(
    fileList,
    (list) => {
      console.log('fileList change -- ', list);
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
      // https://basicai-dataset-tmp-minio-endpoint.alidev.beisai.com/x1-community/1002/750011/84836d71b69e4a8bb600f4d70c3dca24/6dc9504723914a14b95764a5c211b3b0%21400x400.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=admin%2F20220831%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220831T105243Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=3d67eff53e455bd9d884f39d537f75bc986493f297b199e65f4114ae346bbf83
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
      item?.controller.abort();
    });
    fileList.value = [];
    clearInterval(processTimer.value);
  };

  /** Cancel Upload */
  const handleCancelUpload = (item: FileItem) => {
    console.log(item.status);
    // processing阶段无法取消 || item.status == UploadResultStatus.PROCESSING
    if (item.status == UploadResultStatus.UPLOADING) {
      if (isUploading.value) {
        item.controller.abort();
      }
    } else if (item.status == UploadResultStatus.PENDING) {
      item.status = UploadResultStatus.CANCELED;
    }
  };

  /** Upload Start */
  const processTimer = ref(); // 用于定时器
  const isUploading = ref<boolean>(false); // 用于判断是否正在上传中
  /** Local */
  const handleUploadLocal = async (list) => {
    const uploadFileList =
      list.filter(
        (item) =>
          item.status !== UploadResultStatus.SUCCESS &&
          item.status !== UploadResultStatus.ERROR &&
          item.status !== UploadResultStatus.CANCELED,
      ) ?? [];

    if (uploadFileList.length > 0) {
      const fileItem: FileItem = uploadFileList[0];
      if (!fileItem) return;

      const upload = async ({ file: resultImg }) => {
        try {
          // 先生成预签名地址
          const result = await generatePresignedUrl({
            fileName: resultImg.name,
            datasetId: props.id as string,
          });
          // 然后上传到 minIo
          // -- 调整状态为 uploading
          fileItem.status = UploadResultStatus.UPLOADING;
          // 取消请求
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
            // 后台下载、解析 -- 合并到 processing 状态
            // -- 调整状态为 processing, 并重置进度条
            fileItem.status = UploadResultStatus.PROCESSING;
            const temp = uploadProgress.value.filter((item) => item.uuid === fileItem.uuid);
            temp[0].percent = 0;

            try {
              // 请求参数
              const uploadParams: UploadParams = {
                fileUrl: result.accessUrl,
                datasetId: props.id as string,
                source: props.source,
              };
              // 获取流水号 serialNumbers
              const serialNumbers = await uploadDatasetApi(
                uploadParams,
                fileItem.controller.signal,
              );
              const uploadStatus = ref<UploadStatusEnum>(UploadStatusEnum.DOWNLOADING);
              console.log('upload local serialNumbers', serialNumbers);
              // 根据流水号查询
              // -- 定义方法
              const findUploadRecord = async () => {
                try {
                  const record = await findUploadRecordBySerialNumbers(
                    serialNumbers,
                    fileItem.controller.signal,
                  );
                  console.log(record[0]);
                  const {
                    status,
                    errorMessage,
                    downloadedFileSize,
                    totalFileSize,
                    parsedDataNum,
                    totalDataNum,
                  } = record[0];

                  // 状态判断
                  if (status == UploadStatusEnum.FAILED) {
                    throw new Error(errorMessage as string);
                  }
                  uploadStatus.value = status;

                  // 进度 -- 目前为各占 50%
                  const downloadPercent =
                    parseInt((Number(downloadedFileSize ?? 0) / Number(totalFileSize ?? 1)) * 50) ||
                    0;
                  const parsedPercent =
                    parseInt((Number(parsedDataNum ?? 0) / Number(totalDataNum ?? 1)) * 50) || 0;

                  console.log(downloadPercent, '==', parsedPercent);
                  temp[0].percent = downloadPercent + parsedPercent;

                  if (uploadStatus.value == UploadStatusEnum.PARSE_COMPLETED) {
                    clearInterval(processTimer.value);
                    // -- 调整状态为 success
                    fileItem.status = UploadResultStatus.SUCCESS;
                    isUploading.value = false;
                    // 刷新列表
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
              // -- 调用一次
              findUploadRecord();
              // -- 循环调用
              processTimer.value = setInterval(async () => {
                await findUploadRecord();
              }, 3000);
            } catch (e: any) {
              if (e.message == 'canceled') {
                // 被取消
                fileItem.status = UploadResultStatus.CANCELED;
                fileItem.error = String(e.message);
              } else {
                // 其它错误
                fileItem.status = UploadResultStatus.ERROR;
                fileItem.error = String(e);
              }
              isUploading.value = false;
            }
          } catch (e: any) {
            if (e.message == 'canceled') {
              // 被取消
              fileItem.status = UploadResultStatus.CANCELED;
              fileItem.error = String(e.message);
            } else {
              // 其它错误
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
      getBufferWithFile(fileItem.file).then(upload);
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
          item.status !== UploadResultStatus.ERROR &&
          item.status !== UploadResultStatus.CANCELED,
      ) ?? [];
    const fileItem: FileItem = uploadFileList[0];

    if (!fileItem) return;

    // 后台下载、解析 -- 合并到 processing 状态
    // -- 调整状态为 processing, 并重置进度条
    fileItem.status = UploadResultStatus.PROCESSING;
    uploadProgress.value.push({
      uuid: fileItem.uuid,
      percent: 0,
    });
    const temp = uploadProgress.value.filter((item) => item.uuid === fileItem.uuid);
    temp[0].percent = 0;

    try {
      // 取消请求
      fileItem.controller = new AbortController();
      // 请求参数
      const uploadParams: UploadParams = {
        fileUrl: props.uploadUrl,
        datasetId: props.id as string,
        source: props.source,
      };
      // 获取流水号 serialNumbers
      const serialNumbers = await uploadDatasetApi(uploadParams, fileItem.controller.signal);
      const uploadStatus = ref<UploadStatusEnum>(UploadStatusEnum.DOWNLOADING);
      console.log('upload url serialNumbers', serialNumbers);
      // 根据流水号查询
      // -- 定义方法
      const findUploadRecord = async () => {
        try {
          const record = await findUploadRecordBySerialNumbers(
            serialNumbers,
            fileItem.controller.signal,
          );
          console.log(record[0]);
          const {
            status,
            errorMessage,
            downloadedFileSize,
            totalFileSize,
            parsedDataNum,
            totalDataNum,
          } = record[0];

          // 状态判断
          if (status == UploadStatusEnum.FAILED) {
            throw new Error(errorMessage as string);
          }
          uploadStatus.value = status;

          // 进度 -- 目前为各占 50%
          const downloadPercent =
            parseInt((Number(downloadedFileSize ?? 0) / Number(totalFileSize ?? 1)) * 50) || 0;
          const parsedPercent =
            parseInt((Number(parsedDataNum ?? 0) / Number(totalDataNum ?? 1)) * 50) || 0;

          console.log(downloadPercent, '==', parsedPercent);
          temp[0].percent = downloadPercent + parsedPercent;

          if (uploadStatus.value == UploadStatusEnum.PARSE_COMPLETED) {
            clearInterval(processTimer.value);
            // -- 调整状态为 success
            fileItem.status = UploadResultStatus.SUCCESS;
            isUploading.value = false;
            // 刷新列表
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
      // -- 调用一次
      findUploadRecord();
      // -- 循环调用
      processTimer.value = setInterval(async () => {
        await findUploadRecord();
      }, 3000);
    } catch (e: any) {
      if (e.message == 'canceled') {
        // 被取消
        fileItem.status = UploadResultStatus.CANCELED;
        fileItem.error = String(e.message);
      } else {
        // 其它错误
        fileItem.status = UploadResultStatus.ERROR;
        fileItem.error = String(e);
      }
      isUploading.value = false;
    }
  };
  /** Upload End */

  defineExpose({
    fileList,
    // cancelUpload,
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
