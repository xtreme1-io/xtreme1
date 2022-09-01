<template>
  <BasicModal
    :wrapClassName="prefixCls"
    @register="register"
    v-bind="$attrs"
    :title="t('business.task.selectClassTitle')"
    width="720px"
    :canFullscreen="false"
    @ok="handleOk"
    useWrapper
    :okText="t('common.doneText')"
  >
    <div class="wrapper">
      <div class="side">
        <div class="side-header">
          <div>{{ t('business.task.selected') }}</div>
          <div class="clear-all" @click="handleClearAll">{{ t('business.task.clearAll') }}</div>
        </div>
        <div class="selected-list">
          <ClassItem
            v-for="item in selectList"
            :key="item.id"
            :record="item"
            type="remove"
            @handleRemove="handleRemove"
          />
        </div>
      </div>
      <div class="content">
        <div class="search-input">
          <Input.Search v-model:value="word" placeholder="Search classes and classification name" />
        </div>
        <div class="class-content">
          <div class="class-list-header">
            <div>{{ t('business.class.classes') }}</div>
            <div class="add-btn" @click="handleClassAddAll">{{ t('business.task.addAll') }}</div>
          </div>
          <div class="class-list">
            <ClassItem
              v-for="item in showClassList"
              :key="item.id"
              :record="item"
              @handleSelect="handleSelect"
            />
          </div>
          <div class="class-list-header">
            <div>{{ t('business.class.classifications') }}</div>
            <div class="add-btn" @click="handleClassificationAddAll">
              {{ t('business.task.addAll') }}
            </div>
          </div>
          <div class="classification-list">
            <ClassItem
              v-for="item in showClassificationList"
              :key="item.id"
              :record="item"
              @handleSelect="handleSelect"
            />
          </div>
        </div>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import emitter from 'tiny-emitter/instance';
  import { ref, computed, defineEmits, onBeforeMount } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Input } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useDesign } from '/@/hooks/web/useDesign';
  import ClassItem from './ClassItem.vue';
  import { classListApi } from '/@/api/business/class';
  import { useRoute } from 'vue-router';
  import { ClassItem as ClassItemType, ClassTypeEnum } from '/@/api/business/model/classModel';
  const [register, { closeModal }] = useModalInner();
  const { prefixCls } = useDesign('class-selector');
  const { t } = useI18n();
  const word = ref('');
  const handleOk = () => {
    closeModal();
    emits('handleChangeClass', selectList.value);
  };
  const { query } = useRoute();
  const { id } = query;
  const emits = defineEmits(['handleChangeClass']);
  interface listItem extends ClassItemType {
    active: boolean;
  }
  const allList = ref<listItem[]>([]);
  const fetchList = async () => {
    const res = await classListApi({
      page: 1,
      pageSize: 9999,
      datasetId: id as string,
    });
    allList.value = res.list.map((item) => ({ ...item, active: false }));
  };
  onBeforeMount(() => {
    fetchList();
  });
  const list = computed(() => {
    return allList.value.filter((item) => item.active === false);
  });
  const showClassList = computed(() => {
    return list.value.filter(
      (item) => item.type === ClassTypeEnum.CLASS && item.name.includes(word.value),
    );
  });
  const showClassificationList = computed(() => {
    return list.value.filter(
      (item) => item.type === ClassTypeEnum.CLASSIFICATION && item.name.includes(word.value),
    );
  });
  const selectList = computed(() => {
    return allList.value.filter((item) => item.active === true);
  });
  const handleSelect = (id) => {
    allList.value[allList.value.findIndex((item) => item.id === id)].active = true;
  };
  const handleRemove = (id) => {
    allList.value[allList.value.findIndex((item) => item.id === id)].active = false;
  };
  const handleClearAll = () => {
    selectList.value.forEach((item) => {
      item.active = false;
    });
  };
  const handleClassAddAll = () => {
    showClassList.value.forEach((item) => {
      item.active = true;
    });
  };
  const handleClassificationAddAll = () => {
    showClassificationList.value.forEach((item) => {
      item.active = true;
    });
  };

  emitter.on('handleDelClass', (id) => {
    allList.value = allList.value.map((item) =>
      item.id === id ? { ...item, active: false } : item,
    );
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-class-selector';
  .@{prefix-cls} {
    color: #333;

    .wrapper {
      display: flex;

      .side {
        width: 162px;
        margin-right: 20px;
        display: flex;
        flex-direction: column;

        .side-header {
          display: flex;
          justify-content: space-between;
          font-size: 16px;
          line-height: 28px;

          align-items: center;
          margin-bottom: 12px;

          .clear-all {
            cursor: pointer;
            font-size: 14px;
            color: @primary-color;
          }
        }

        .selected-list {
          height: 363px;
          border: 1px solid #cccccc;
          border-radius: 4px;
          padding: 6px;
          padding-right: 0;
          overflow-y: scroll;

          .class-item {
            width: 100%;
          }
        }
      }

      .content {
        width: 500px;

        .search-input {
          margin-bottom: 12px;
        }

        .class-content {
          border: 1px solid #cccccc;
          border-radius: 4px;
          height: 363px;
          padding-left: 10px;
          padding-top: 10px;
          overflow-y: scroll;

          .class-list-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 16px;
            line-height: 19px;
            margin-bottom: 10px;

            .add-btn {
              cursor: pointer;
              font-size: 14px;
              line-height: 16px;
              color: @primary-color;
            }
          }

          .classification-list,
          .class-list {
            margin-bottom: 10px;
            display: flex;
            flex-wrap: wrap;

            .class-item {
              width: 120px;
            }
          }
        }
      }
    }
  }
</style>
