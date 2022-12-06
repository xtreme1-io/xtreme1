<template>
  <div class="tag__list">
    <!-- lidar\image -->
    <template v-if="!isGroup">
      <Tag.CheckableTag v-for="item in tagList" :key="item.name" v-model:checked="item.checked">
        {{ item.name }}
      </Tag.CheckableTag>
    </template>
    <!-- image - group -->
    <template v-else>
      <div class="group">
        <template v-for="(item, index) in tagList" :key="item.name">
          <div
            class="group--super"
            :class="{ isCheck: item.checked }"
            @click="handleToggleSelect(item, index)"
          >
            {{ item.name }}
          </div>
          <div class="group--child">
            <Tag.CheckableTag
              v-for="child in item.subClasses"
              :key="child.name"
              v-model:checked="child.checked"
            >
              {{ child.name }}
            </Tag.CheckableTag>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
<script lang="ts" setup>
  import { computed, watch } from 'vue';
  import { Tag } from 'ant-design-vue';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';

  const props = defineProps<{ classes: any[]; datasetType: datasetTypeEnum }>();
  const emits = defineEmits(['update:classes']);

  // 是否图片类型
  // const isImage = computed(() => {
  //   return props.datasetType == datasetTypeEnum.IMAGE;
  // });
  // 是否分组
  const isGroup = computed(() => {
    return !!props.classes?.[0]?.subClasses;
  });

  // 处理后的数据
  const tagList = computed<any[]>({
    get() {
      return props.classes;
    },
    set(value) {
      emits('update:classes', value);
    },
  });

  // 监听 tagList ，用来切换 superLabel 状态
  watch(
    tagList,
    (newTagList) => {
      if (!isGroup.value) return;

      // 分组数据的 subClasses ---
      newTagList.forEach((item) => {
        item.checked = item.subClasses.every((item) => item.checked);
      });
    },
    { deep: true, immediate: true },
  );

  // 切换选中状态
  const handleToggleSelect = (item, index) => {
    // 先变换 item 状态
    const checked = (item.checked = !item.checked);
    // 再变换 subClasses 状态
    tagList.value[index].subClasses.forEach((child) => {
      child.checked = checked;
    });
  };
</script>
<style lang="less" scoped>
  .tag__list {
    // height: 200px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 0;
    }
  }

  .group {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;

    .isCheck {
      border: 1px solid #57ccef;
      background: #57ccef;
      color: #fff;
    }

    &--super {
      height: 24px;
      text-align: center;
      background: rgba(204, 204, 204, 0.1);
      line-height: 20px;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 0 10px;

      &::after {
        content: url('/@/assets/svg/closeNotActive.svg');
        display: inline-block;
        width: 8px;
        height: 8px;
        padding: 0 6px;
      }

      &.isCheck::after {
        content: url('/@/assets/svg/closeActive.svg');
        display: inline-block;
        width: 8px;
        height: 8px;
        padding: 0 6px;
      }
    }

    &--child {
      flex: 1;

      .ant-tag {
        border: none;
        background: none;

        &.ant-tag-checkable-checked {
          border: none;
          background: none;
          color: #57ccef;

          &::after {
            content: url('/@/assets/svg/closeActive2.svg');
          }
        }
      }
    }
  }

  .ant-tag {
    font-size: 14px;
    color: #333;
    cursor: pointer;
    user-select: none;

    height: 24px;
    padding: 4 10px;
    margin-bottom: 10px;
    background: rgba(204, 204, 204, 0.1);
    border: 1px solid #ccc;
    border-radius: 4px;

    &::after {
      content: url('/@/assets/svg/closeNotActive.svg');
      display: inline-block;
      width: 8px;
      height: 8px;
      padding: 0 6px;
    }

    &.ant-tag-checkable:not(.ant-tag-checkable-checked):hover {
      color: unset;
    }
    // 选中项
    &.ant-tag-checkable-checked {
      border: 1px solid #57ccef;
      background: #57ccef;
      color: #fff;

      &::after {
        content: url('/@/assets/svg/closeActive.svg');
        display: inline-block;
        width: 8px;
        height: 8px;
        padding: 0 6px;
      }
    }
  }
</style>
