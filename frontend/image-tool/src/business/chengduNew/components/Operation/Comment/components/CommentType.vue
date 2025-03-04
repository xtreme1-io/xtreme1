<template>
  <div class="comment-type">
    <div class="type-content">
      <span v-if="props.showType" class="type-label">{{ t('image.Type') }}:</span>
      <div
        class="type-item"
        v-for="typ in props.item.types"
        :key="typ.entityId"
        :style="{ backgroundColor: CommentTypeColor[typ.severity] }"
      >
        {{ typ.name }}
      </div>
    </div>
    <div
      v-if="props.item.types.some((t) => t.wrongType === CommentWrongType.MISS)"
      class="type-content"
      style="margin-top: 10px"
    >
      <span v-if="props.showType" class="type-label">{{ t('image.class') }}:</span>
      <span
        v-if="classItem"
        class="item limit class-item no-hover"
        :title="editor.showNameOrAlias(classItem)"
        :style="{ color: classItem.color }"
      >
        <ToolIcon :tool="classItem.toolType" />&nbsp;{{ editor.showNameOrAlias(classItem) }}
      </span>
      <span v-else>-</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { useInjectBSEditor } from '../../../../context';
  import { CommentTypeColor, CommentWrongType } from '@/business/chengduNew/config/comment';
  import { ICommentItem } from '@/business/chengduNew/type';
  import { ToolIcon } from 'image-editor';
  import { computed } from 'vue';
  import { t } from '@/lang';

  const editor = useInjectBSEditor();
  const props = defineProps<{
    item: ICommentItem;
    showType: boolean;
  }>();
  const classItem = computed(() => {
    const classId = props.item.classId;
    return classId ? editor.getClassType(classId) : undefined;
  });
</script>
<style lang="less" scoped>
  .comment-type {
    display: flex;
    position: relative;
    width: 100%;
    flex-direction: column;
    // display: flex;
    // gap: 20px;
    .type-content {
      display: inline-flex;
      align-items: baseline;
      flex-wrap: wrap;
      float: left;
      gap: 6px;

      .type-label {
        float: left;
      }

      .type-item {
        display: inline-flex;
        padding: 12px 10px;
        border-radius: 30px;
        justify-content: center;
        align-items: center;
        float: left;
        height: 20px;
        text-indent: 0;
        color: #ffffff;
      }
    }
  }
</style>
