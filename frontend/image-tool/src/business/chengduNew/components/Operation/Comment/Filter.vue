<template>
  <div class="comment-filter">
    <a-spin :spinning="props.loading" tip="Loading...">
      <div class="comment-filter-body">
        <!-- Creator -->
        <div class="title">{{ t('image.filterByCreator') }}</div>
        <div>
          <a-radio-group v-model:value="filterParams.creator">
            <a-radio value="0">{{ t('image.all') }}</a-radio>
            <a-radio value="1">{{ t('image.you') }}</a-radio>
          </a-radio-group>
        </div>
        <!-- Stage -->
        <div class="title">{{ t('image.filterByStage') }}</div>
        <div>
          <a-tree
            v-if="props.stageTree.length > 0"
            checkable
            :treeData="stageTree"
            :defaultExpandAll="true"
            v-model:checkedKeys="filterParams.stages"
            @check="handleStageCheck"
            :selectable="false"
          >
          </a-tree>
        </div>
        <!-- Type -->
        <div class="title">{{ t('image.filterByType') }}</div>
        <div>
          <a-tree
            class="typeFilter"
            checkable
            :treeData="typeTree"
            :defaultExpandAll="true"
            v-model:checkedKeys="filterParams.types"
            @check="handleTypeCheck"
            :selectable="false"
          >
            <template #title="{ title }">
              <span :style="{ backgroundColor: CommentTypeColor[title] }" class="type-title">
                {{ editor.tI(CommentTypeText[title] || title) }}
              </span>
            </template>
          </a-tree>
        </div>
      </div>
      <div class="comment-filter-divider"></div>
      <div class="comment-filter-footer">
        <a-button @click="handleReset">{{ t('image.Reset') }}</a-button>
        <a-button type="primary" @click="handleApply"> {{ t('image.Apply') }} </a-button>
      </div>
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, computed, onMounted } from 'vue';
  import { useInjectBSEditor } from '../../../context';
  import { t } from '@/lang';

  import { CommentTypeText, CommentTypeColor } from '../../../config/comment';
  import { typeTreeData } from './data';

  const editor = useInjectBSEditor();
  const commentState = editor.bsState.commentState;

  const props = defineProps<{ hasFilter: boolean; loading: boolean; stageTree: any[] }>();
  const emits = defineEmits(['apply', 'reset', 'update:hasFilter']);

  const filterParams: {
    creator: '0' | '1';
    stages: any[];
    types: any[];
  } = reactive({
    creator: '0',
    stages: [],
    types: [],
  });

  onMounted(async () => {
    setStateToFilter();
  });
  const setStateToFilter = () => {
    const { createdBy, stageName, types } = commentState.filterObj;
    filterParams.creator = createdBy == 'All' ? '0' : '1';
    filterParams.stages = stageName;
    filterParams.types = types;
  };

  // Stage 数据

  const handleStageCheck = () => {};
  // Tree 数据
  const typeTree = computed(() => {
    return typeTreeData;
  });
  const handleTypeCheck = () => {};

  // 重置
  const handleReset = () => {
    commentState.filterObj = {
      createdBy: 'All',
      stageName: ['All'],
      types: ['All'],
    };
    setStateToFilter();

    emits('reset');
  };
  // 确认
  const handleApply = () => {
    const createdBy = filterParams.creator == '0' ? 'All' : editor.bsState.user.id;
    const stageName = filterParams.stages;
    const types = filterParams.types;
    commentState.filterObj = {
      createdBy,
      stageName,
      types,
    };
    if (stageName.includes('All') && createdBy == '0' && types.includes('All')) {
      emits('apply');
    } else {
      emits('apply');
      emits('update:hasFilter', true);
    }
  };
</script>
<style lang="less" scoped>
  .comment-filter {
    &-body {
      display: flex;
      overflow: overlay;
      max-height: 467px;
      color: rgb(255 255 255 / 85%);
      flex-direction: column;
      gap: 10px;

      .title {
        font-size: 14px;
        line-height: 16px;
        color: #dee5eb;
      }
    }

    &-divider {
      margin-top: 10px;
      width: 100%;
      height: 1px;
      background-color: #303030;
      // transform: scaleX(2);
    }

    &-footer {
      display: flex;
      padding-top: 10px;
      justify-content: space-between;

      .ant-btn {
        border-radius: 6px;
      }
    }
  }

  :deep(.ant-tree) {
    .type-title {
      display: flex;
      padding: 0 10px;
      border-radius: 30px;
      justify-content: center;
      align-items: center;
    }
  }
</style>
