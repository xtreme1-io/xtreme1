<template>
  <div class="comment-tool" v-show="editor.state.config.showComment && !editor.state.isHistoryView">
    <div
      class="comment-tag limit"
      v-for="(item, index) in iState.tags"
      :key="index"
      v-show="item.commentItem?.display"
      :style="getTagStyle(item)"
      @click="onCommentClick(item)"
      @dblclick="onCommentItemDBClick(item)"
    >
      <CommentOutlined class="icon" />
      <span class="msg">
        {{ item.typeTxt }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { CommentOutlined } from '@ant-design/icons-vue';
  import { throttle } from 'lodash';
  import useComment from './useComment';
  import { useInjectBSEditor } from '../../context';

  const editor = useInjectBSEditor();
  const { iState, getTagStyle, onCommentDomClick, onCommentDBClick } = useComment();
  const onCommentClick = throttle(
    (item) => {
      onCommentDomClick(item);
    },
    300,
    {
      leading: true,
      trailing: false,
    },
  );
  const onCommentItemDBClick = throttle(
    (item) => {
      onCommentDBClick(item);
    },
    1000,
    {
      leading: true,
      trailing: false,
    },
  );
</script>

<style lang="less">
  .comment-tool {
    position: absolute;
    user-select: none;

    .comment-tag {
      display: inline-block;
      position: absolute;
      top: 100px;
      left: 100px;
      padding: 0 6px 0 4px;
      border-radius: 10px 30px 30px 0;
      max-width: 180px;
      background: white;
      text-align: left;
      white-space: nowrap;
      color: #ff9595;
      cursor: pointer;

      .icon {
        margin-right: 4px;
      }
    }
  }
</style>
