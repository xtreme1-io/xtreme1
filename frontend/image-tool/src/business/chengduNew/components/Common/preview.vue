<template>
  <div class="pdf-preview-container">
    <div class="pdf-preview">
      <div class="attachments">
        <div
          style="display: inline-block; max-width: 100%"
          v-for="item in state.fileList"
          :key="item.url"
        >
          <div :title="item.name" class="attachment-item">
            <FileTextOutlined class="file-icon" />
            <span class="file-item"> {{ item.name }} </span>
            <SelectOutlined @click="handlePreviewPdf(item.url)" class="file-icon-open" />
          </div>
        </div>
      </div>
      <div class="pdf" v-html="state.instruction"></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, reactive } from 'vue';
  import * as api from '@/business/chengduNew/api';
  import { SelectOutlined, FileTextOutlined } from '@ant-design/icons-vue';
  import useToken from '../../hook/useToken';
  import { setToken } from '../../api/base';
  import useQuery from '../../hook/useQuery';

  const { query } = useQuery();
  const state = reactive({
    instruction: '',
    fileList: [] as any[],
  });

  const token = useToken();

  onMounted(async () => {
    setToken(token);

    const res = await api.getTaskInfo(query.taskId as string);
    state.instruction = res.instruction;
    state.fileList = res.instructionFiles || [];
  });

  const handlePreviewPdf = (url: any) => {
    // if (url.endsWith('.pdf')) {
    //     const resolveUrl = router.resolve({ path: 'pdf', query: { url: url } });
    //     window.open(resolveUrl.href, '_blank');
    // }
    if (url.endsWith('.pdf')) {
      window.open(window.location.origin + '/tool/pc/pdf?url=' + url, '_blank');
    }
  };
</script>
<style lang="less">
  .pdf-preview-container {
    position: absolute;
    overflow-y: scroll;
    width: 100vw;
    height: 100vh;
    background: white;
    text-align: left;

    &::-webkit-scrollbar {
      width: 0;
    }

    .pdf-preview {
      margin: 40px auto;
      padding: 15px;
      border: 12px solid #e6f7fd;
      border-radius: 20px;
      width: 1000px;
      color: #333333;

      .wrapper {
        margin-top: 10px;
        padding: 15px;
        border-radius: 12px;
        background: white;
      }

      .attachments {
        margin-right: -24px;
        margin-bottom: 12px;
        margin-left: -24px;
        padding: 0 15px;
        min-height: 4px;

        .attachment-item {
          display: flex;
          padding: 0 4px;
          align-items: center;

          .file-icon {
            display: block;
            padding: 2px;
            border-radius: 2px;
            background: white;
            font-size: 24px;
            color: @primary-color;
          }

          .file-item {
            display: block;
            padding: 0 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #aaaaaa;
            cursor: pointer;
          }

          .file-icon-open {
            display: block;
            font-size: 24px;
            color: @primary-color;
            transform: rotateY(180deg);

            &:hover {
              opacity: 0.8;
            }
          }
        }
      }

      .pdf {
        margin: 10px 0;
      }
    }

    img {
      width: 100%;
    }
  }
</style>
