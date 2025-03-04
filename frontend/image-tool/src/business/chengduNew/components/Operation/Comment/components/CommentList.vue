<template>
  <div class="comment-list">
    <ListHeader v-bind="$attrs" :count="listLen" :commentItem="props.commentItem">
      <template v-for="item in showCommentList" :key="item.contentId">
        <ListItem
          v-bind="$attrs"
          class="comment-list-item"
          :class="{ hide: showViewAll }"
          :content="item.content"
          :avatarUrl="item.avatarUrl"
          :nickname="item.creatorName"
          :stage="item.stageName"
          :createdBy="String(item.createdBy)"
          :time="item.createdAt"
        />
      </template>
      <div v-if="showViewAll" class="view" @click="handleExpand">
        {{ `${t('image.View All')} (${listLen})` }}
      </div>
    </ListHeader>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { ICommentItem } from '@/business/chengduNew/type';
  import { t } from '@/lang';

  import ListHeader from './ListHeader.vue';
  import ListItem from './ListItem.vue';

  const props = defineProps<{ commentItem: ICommentItem }>();
  const listLen = computed(() => {
    return props.commentItem.replies?.length || 0;
  });

  const showCommentList = computed(() => {
    let list = [props.commentItem];
    if (props.commentItem.replies) list = list.concat(props.commentItem.replies);
    return isExpand.value ? list : list.slice(0, 3);
  });

  const showViewAll = computed(() => {
    return listLen.value > 2 && !isExpand.value;
  });
  const isExpand = ref<boolean>(false);
  const handleExpand = () => {
    isExpand.value = true;
  };
</script>
<style lang="less" scoped>
  .comment-list-item {
    border-bottom: 1px solid #4e4e4e;

    &.hide {
      &:nth-child(3) {
        border-color: transparent;
      }
    }
  }

  .view {
    padding-bottom: 5px;
    color: @primary-color;
    cursor: pointer;
  }
</style>
