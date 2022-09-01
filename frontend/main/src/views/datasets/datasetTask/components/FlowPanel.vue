<template>
  <div class="flow-pannel">
    <div class="flow-wrapper">
      <div class="flow-list" ref="flowListRef">
        <Panel
          :list="props.list.slice(0, 1)"
          @addUser="addUser"
          @handleClearUser="handleClearUser"
        />
        <Panel
          :list="props.list.slice(1)"
          :canDrag="props.list.length > 2"
          canDelete
          :handleDel="handleDel"
          @addUser="addUser"
          @handleClearUser="handleClearUser"
          :status="status"
        />
      </div>
      <div class="item" v-if="status === TaskStatusEnum.UN_PUBLISH">
        <div class="arrow">
          <Icon icon="ri:arrow-right-s-fill" size="24" />
        </div>
        <div class="action-wrap">
          <div class="desc"> {{ t('business.task.addStage') }}</div>
          <div class="actions">
            <img
              @click="addAnnotate"
              src="../../../../assets/images/task/stageAnnotation.png"
              alt=""
            />
            <img @click="addReview" src="../../../../assets/images/task/stageReview.png" alt="" />
          </div>
        </div>
      </div>
      <div class="success-status">
        <Icon style="color: #7ff0b3" icon="ep:success-filled" size="36" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, onMounted, nextTick, defineProps, defineEmits } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useSortable } from '/@/hooks/web/useSortable';
  import Icon from '/@/components/Icon';
  import Panel from './Panel.vue';
  import { StageItem, StageTypeEnum, TaskStatusEnum } from '/@/api/business/model/taskModel';
  const { t } = useI18n();
  const flowListRef = ref<ComponentRef>(null);
  const props = defineProps<{ list: StageItem[]; status: TaskStatusEnum | undefined }>();
  const emit = defineEmits(['handleAddStage', 'addUser', 'handleClearUser', 'handleDel']);
  onMounted(() => {
    nextTick(() => {
      const flowListEl = unref(flowListRef);
      console.log(flowListEl);
      if (!flowListEl) return;
      const el = flowListEl as any;
      console.log(el);
      if (!el) return;
      // Drag and drop sort
      const { initSortable } = useSortable(unref(el), {
        animation: 500,
        delay: 400,
        delayOnTouchOnly: true,
        handle: '.drag',
        draggable: '.canDrag',
        ghostClass: 'wrapper-box',
      });
      initSortable();
    });
  });

  const addAnnotate = () => {
    emit('handleAddStage', StageTypeEnum.ANNOTATION);
  };
  const addReview = () => {
    emit('handleAddStage', StageTypeEnum.REVIEW);
  };
  const addUser = (id, user) => {
    emit('addUser', id, user);
  };
  const handleClearUser = (id) => {
    emit('handleClearUser', id);
  };
  const handleDel = (id) => {
    emit('handleDel', id);
  };
</script>
<style lang="less" scoped>
  @import url('../index.less');
</style>
