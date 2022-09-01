<template>
  <div>
    <Collapse :style="customStyle" v-model:activeKey="activeKey">
      <template #expandIcon="{ isActive }">
        <caret-right-outlined :rotate="isActive ? 90 : 0" />
      </template>
      <CollapsePanel
        key="1"
        :header="props.type.charAt(0).toUpperCase() + props.type.slice(1)"
        :style="customStyle"
      >
        <div
          class="option"
          v-for="(record, index) in dataSchema[props.type]"
          :key="record.name"
          @click="
            () => {
              handleGo(index);
            }
          "
        >
          <span>{{ record.name }}</span>
          <Icon style="color: #ccc" size="22" icon="ic:sharp-arrow-forward" />
        </div>
        <div class="option-item" v-for="item in list" :key="item.id">
          <Input autocomplete="off" v-model:value="val[item.id]" />
          <div
            class="del-action"
            @click="
              () => {
                handleDel(item.id);
              }
            "
          >
            <Icon style="color: #ccc" size="22" icon="mdi:delete-forever" />
          </div>
          <div
            class="confirm-action"
            @click="
              () => {
                handleAddJson(item.id);
              }
            "
          >
            <CheckOutlined style="color: #ccc; font-size: 18px" />
          </div>
        </div>
        <div class="add" @click="handleAdd">
          <Icon style="color: #57ccef" icon="ic:baseline-add" size="20" />
          {{ t('common.addText') }}
        </div>
      </CollapsePanel>
    </Collapse>
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, defineProps } from 'vue';
  import { CaretRightOutlined, CheckOutlined } from '@ant-design/icons-vue';
  import { Collapse, CollapsePanel, Input } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { dataProps } from './typing';
  import { attributeFactory, optionFactory } from './utils';
  import Icon from '/@/components/Icon';

  const activeKey = ref(['1']);
  const val = ref({});
  const props = defineProps(dataProps);
  type Item = {
    id: number;
  };
  const { t } = useI18n();
  const customStyle = 'background: white;border:none';
  const list = ref<Item[]>([]);
  const handleAdd = () => {
    list.value.push({ id: list.value.length + 1 });
  };
  const handleDel = (id) => {
    list.value.splice(
      list.value.findIndex((item) => item.id === id),
      1,
    );
  };
  const handleAddJson = (id) => {
    handleDel(id);
    const value = unref(val)[id];
    props.handleSet &&
      props.handleSet({
        setType: 'add',
        setValue: props.type === 'attributes' ? attributeFactory(value) : optionFactory(value),
      });
    unref(val)[id] = '';
  };

  const handleGo = (index) => {
    props.handleAddIndex && props.handleAddIndex(index);
  };
</script>
<style lang="less" scoped>
  @import url('./index.less');
</style>
