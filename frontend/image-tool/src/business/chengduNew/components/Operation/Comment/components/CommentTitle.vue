<template>
  <div class="comment-title">
    <div class="header">
      <div class="order">{{ props.order }}</div>
      <div class="title">
        <span>{{ t('image.object') }}: </span>
        <a-tooltip>
          <template #title>{{ showObj.tips }}</template>
          <ToolIcon
            v-if="showObj.icon"
            :tool="showObj.icon"
            style="margin-right: 3px; font-size: 14px"
          />
          <span>{{ showObj.text }}</span>
        </a-tooltip>
      </div>
    </div>
    <CommentAction
      v-bind="$attrs"
      :id="item.id"
      :item="item"
      :uuid="uuid"
      :createdBy="item.createdBy + ''"
    />
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { useInjectBSEditor } from '../../../../context';
  import { ToolIcon } from 'image-editor';
  import { ICommentItem } from '@/business/chengduNew/type';
  import { CommentObjectType, CommentTabType } from '../../../../config/comment';
  import { t } from '@/lang';

  import CommentAction from './CommentAction.vue';

  const props = defineProps<{
    order: string | number;
    // id: number | string;
    // objectId?: number | string;
    uuid: string;
    // createdBy: string;
    item: ICommentItem;
  }>();

  const editor = useInjectBSEditor();
  const showObj = computed(() => {
    let icon: any = '';
    let text: string = 'Null';
    let tips: string = 'Null';
    if (props.item.objectId) {
      const shape = editor.dataManager.getObject(
        props.item.objectId as string,
        editor.getFrame(String(props.item.dataId)),
      );
      if (shape) {
        icon = shape.toolType;
        text = shape.userData.trackName;
        tips = `${shape.className} (${shape.userData.trackName})`;
        if (
          props.item.attributes?.commentObjectType === CommentObjectType.POINT ||
          props.item.attributes?.commentObjectType === CommentTabType.point
        ) {
          text += ` · ${props.item.attributes.pointIndex + 1}`;
        }
      }
    }
    return { icon, text, tips };
  });
</script>
<style lang="less" scoped>
  .comment-title {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      line-height: 16px;
      color: #dee5eb;

      .order {
        padding: 1px 2px;
        border: 1px solid #cccccc;
        border-radius: 20px;
      }

      .title {
        overflow: hidden;
        width: 140px;
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
</style>
