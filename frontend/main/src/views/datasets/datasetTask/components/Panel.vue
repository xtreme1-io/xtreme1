<template>
  <div :class="`item ${canDrag ? 'canDrag' : null}`" v-for="item in list" :key="item.type">
    <div class="arrow">
      <Icon icon="ri:arrow-right-s-fill" size="24" />
    </div>
    <div class="card-title">
      <div v-if="item.type === StageTypeEnum.ANNOTATION" class="wrap">
        <img src="../../../../assets/images/task/stageAnnotation.png" alt="" />
        Annotate
      </div>
      <div v-else class="wrap">
        <img src="../../../../assets/images/task/stageReview.png" alt="" />
        Review
      </div>
      <div class="action-icon">
        <Icon v-if="canDrag" class="drag order" icon="ion:reorder-three" size="18" />
        <Icon
          v-if="canDelete && status === TaskStatusEnum.UN_PUBLISH"
          icon="mdi:delete-forever"
          size="18"
          @click="
            () => {
              handleDel && handleDel(item.tempId as number);
            }
          "
        />
      </div>
    </div>
    <div class="user-list">
      <div class="search">
        <Input.Search :placeholder="t('common.searchText')" v-model:value="searchText" />
      </div>
      <div class="list">
        <div
          :class="`user  ${item.operatorIds.length === 0 && 'active'}`"
          @click="
            () => {
              emits('handleClearUser', item.tempId);
            }
          "
        >
          <img :src="placeImg" alt="" />
          <span>Anyone</span>
        </div>
        <div
          v-for="record in showuserList"
          :key="record.id"
          :class="`user ${
            item.operatorIds.length > 0 && item.operatorIds.includes(record.user.id as number) && 'active'
          }`"
          @click="
            () => {
              handleToggleUser(item.tempId, record.user.id);
            }
          "
        >
          <img :src="record?.user?.avatarUrl || placeImg" alt="" />
          {{ record?.user?.nickname }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, defineProps, defineEmits, inject, computed } from 'vue';
  import { Input } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { StageItem, StageTypeEnum, TaskStatusEnum } from '/@/api/business/model/taskModel';
  import Icon from '/@/components/Icon';
  import { TeamUserList } from '/@/api/business/model/teamModel';
  import placeImg from '/@/assets/images/task/stageAnnotation.png';
  const searchText = ref('');
  const userList: TeamUserList = inject('userList', []);
  const { t } = useI18n();
  const emits = defineEmits(['addUser', 'handleClearUser']);
  defineProps<{
    list: StageItem[];
    canDelete?: boolean;
    canDrag?: boolean;
    handleDel?: (id: string | number) => void;
    status?: TaskStatusEnum | undefined;
  }>();
  const showuserList = computed(() => {
    return unref(userList).filter((item) => item?.user?.nickname.includes(searchText.value));
  });
  const handleToggleUser = (id, userId) => {
    emits('addUser', id, userId);
  };
</script>
<style lang="less" scoped>
  @import url('../index.less');
</style>
