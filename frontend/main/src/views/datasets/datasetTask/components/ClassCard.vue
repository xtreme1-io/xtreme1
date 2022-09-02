<template>
  <div class="class-card">
    <div class="title">
      <div class="wrapper">
        <div class="type">
          <img class="title-img" :src="imgFactory(record)" alt="" />
        </div>
        <div class="name">{{ record.name }}</div>
      </div>
      <div class="delAction" v-if="status === TaskStatusEnum.UN_PUBLISH">
        <Icon icon="ri:subtract-fill" @click="handleDelClass" />
      </div>
    </div>
    <div class="content-list">
      <div class="content-item" v-for="item in JSON.parse(record.attributes)" :key="item.name">
        <img v-if="inputItemImg[item.type]" :src="inputItemImg[item.type]" alt="" />
        {{ item.name }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import emitter from 'tiny-emitter/instance';
  import { defineProps, defineEmits } from 'vue';
  import { TaskStatusEnum } from '/@/api/business/model/taskModel';
  import Icon from '/@/components/Icon';
  import { imgFactory } from '/@/utils/business/classUtil';
  import { inputItemImg } from '/@/views/datasets/datasetClass/components/formSchemas';
  const props = defineProps<{
    record: any;
    status: TaskStatusEnum | undefined;
  }>();
  const emits = defineEmits(['handleRemoveClass']);
  const handleDelClass = () => {
    emitter.emit('handleDelClass', props.record.id);
    emits('handleRemoveClass', props.record.id);
  };
</script>
<style lang="less" scoped>
  .class-card {
    width: 102px;
    height: 102px;
    border: 1px solid #cccccc;
    box-sizing: border-box;
    border-radius: 4px;
    padding: 10px 10px 8px;

    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .wrapper {
        display: flex;
        align-items: center;

        .type {
          .title-img {
            width: 17px;
          }
        }

        .name {
          margin-left: 10px;
          font-size: 16px;
          line-height: 19px;
          max-width: 38px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
      }
    }

    .content-list {
      .content-item {
        font-size: 12px;
      }
    }
  }
</style>
