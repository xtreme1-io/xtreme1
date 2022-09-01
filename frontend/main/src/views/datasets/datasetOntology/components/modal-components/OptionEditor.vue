<template>
  <div>
    <div class="editor__panel">
      <!-- 顶部 -->
      <div class="editor__header">
        <!-- 标题 -->
        <div class="header__title">
          <span>{{ props.type.charAt(0).toUpperCase() + props.type.slice(1) }}</span>
        </div>
      </div>
      <!-- 校验 -->
      <div v-show="props.showRequired" class="editor__required">
        {{ t('business.ontology.modal.optionsRequired') }}
      </div>
      <!-- 回显 -->
      <div
        class="editor__option"
        v-for="(record, index) in props.dataSchema[props.type]"
        :key="record.name"
        @click="handleGo(index)"
      >
        <span class="editor__option--name">{{ record.name }}</span>
        <div class="flex">
          <img v-if="hasChild(record)" :src="TreeIcon" class="mr-8px" />
          <Icon style="color: #ccc" size="22" icon="ic:sharp-arrow-forward" />
        </div>
      </div>
      <!-- 新增框 -->
      <div v-show="showInput" class="editor__addition">
        <Input
          autocomplete="off"
          ref="inputRef"
          v-model:value="additionValue"
          @blur.prevent="onBlur"
        />
        <!-- 删除 -->
        <div class="editor__addition--del" @click="handleDelete">
          <Icon style="color: #ccc" size="22" icon="mdi:delete-forever" />
        </div>
        <!-- 保存 -->
        <div class="editor__addition--save" @click="handleSave">
          <CheckOutlined style="color: #ccc; font-size: 18px" />
        </div>
      </div>
      <!-- 添加按钮 -->
      <div class="editor__add" @click="handleAdd">
        <Icon style="color: #57ccef" icon="ic:baseline-add" size="20" />
        {{ t('common.addText') }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, inject, watch } from 'vue';
  // 组件
  import { CheckOutlined } from '@ant-design/icons-vue';
  import { Input } from 'ant-design-vue';
  import Icon from '/@/components/Icon';
  import TreeIcon from '/@/assets/svg/ontology/tree.svg';
  // 工具
  import emitter from 'tiny-emitter/instance';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { attributeFactory, optionFactory } from './utils';

  const { t } = useI18n();

  const changeShowEdit = inject('changeShowEdit', Function, true);
  const emits = defineEmits(['update:showRequired']);
  const props = defineProps<{
    dataSchema?: any;
    handleSet?: Function;
    handleAddIndex?: Function;
    type: string;
    showRequired?: boolean;
    isBasic?: boolean;
  }>();

  // 新增相关信息
  // 是否显示 input
  const showInput = ref<boolean>(false);
  watch(showInput, (newVal) => {
    changeShowEdit(newVal);
  });
  // 获取 input 元素
  const inputRef = ref<Nullable<HTMLElement>>(null);
  // input 绑定值
  const additionValue = ref<string>('');
  // input 失焦事件
  const onBlur = () => {
    setTimeout(() => {
      // handleDelete();
    }, 500);
  };
  // 新增
  const handleAdd = () => {
    showInput.value = true;
    setTimeout(() => {
      inputRef.value!.focus();
    }, 200);
  };
  // 保存
  const handleSave = () => {
    const value = unref(additionValue.value);
    props.handleSet &&
      props.handleSet({
        setType: 'add',
        setValue: props.type === 'attributes' ? attributeFactory(value) : optionFactory(value),
      });

    // 重置
    handleDelete();

    if (props.type === 'attributes') {
      // -- 保存之后，如果是 AttrForm ，则立即进入
      const length = props.dataSchema[props.type].length;
      handleGo(length - 1);
    } else {
      // -- 保存之后，如果是 Options ，则隐藏校验信息
      emits('update:showRequired', false);
    }
  };
  // 删除
  const handleDelete = () => {
    additionValue.value = '';
    showInput.value = false;
  };

  // 点击
  const handleGo = (index) => {
    if (!props.isBasic) {
      if (emitter.e.handleSaveForm) {
        emitter.emit('handleSaveForm', { type: 'go', index: index });
      } else {
        props.handleAddIndex && props.handleAddIndex(index);
      }
    } else {
      props.handleAddIndex && props.handleAddIndex(index);
    }
  };

  // 判断 record 是否有子级
  const hasChild = (record: any) => {
    if (record?.attributes) {
      return record?.attributes.length > 0;
    } else if (record?.options) {
      return record?.options.length > 0;
    } else {
      return false;
    }
  };
</script>
<style lang="less" scoped>
  // @import url('./index.less');

  .editor__panel {
    position: relative;
    margin-bottom: 10px;

    .editor__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 24px;
      margin-bottom: 10px;

      .header__title {
        position: relative;

        span {
          font-weight: 500; //font-weight: 600;

          font-size: 16px;
          color: #333;
          line-height: 19px;
        }
      }

      .header__add {
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        font-size: 12px;
      }
    }

    .editor__required {
      color: #f8827b;
      transform: translateY(-10px);
    }

    .editor__option {
      cursor: pointer;
      border: 1px solid #ccc;
      justify-content: space-between;
      display: flex;
      align-items: center;
      border-radius: 4px;
      height: 28px;
      padding-left: 10px;
      padding-right: 5px;
      margin-bottom: 10px;

      &:hover {
        background-color: rgba(87, 204, 239, 0.15);
      }

      .editor__option--name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .editor__addition {
      display: flex;
      align-items: center;
      margin-bottom: 10px;

      input {
        flex: 1;
      }

      .editor__addition--del,
      .editor__addition--save {
        margin-left: 3px;
        cursor: pointer;
        width: 24px;
        height: 24px;
        line-height: 24px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;

        &:hover {
          background: #f5f5f5;
        }
      }
    }

    .editor__add {
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      font-size: 12px;
    }
  }
</style>
