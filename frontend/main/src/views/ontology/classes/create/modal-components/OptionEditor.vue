<template>
  <div>
    <div class="editor__panel">
      <div class="editor__header">
        <div class="header__title">
          <span>{{ props.type.charAt(0).toUpperCase() + props.type.slice(1) }}</span>
        </div>
      </div>
      <div v-show="props.showRequired" class="editor__required">
        {{ t('business.ontology.modal.optionsRequired') }}
      </div>
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
      <div v-show="showInput" class="editor__addition">
        <Input
          autocomplete="off"
          ref="inputRef"
          v-model:value="additionValue"
          @blur.prevent="onBlur"
        />
        <div class="editor__addition--del" @click="handleDelete">
          <Icon style="color: #ccc" size="22" icon="mdi:delete-forever" />
        </div>
        <div class="editor__addition--save" @click="handleSave">
          <CheckOutlined style="color: #ccc; font-size: 18px" />
        </div>
      </div>
      <div class="editor__add" @click="handleAdd">
        <Icon style="color: #57ccef" icon="ic:baseline-add" size="20" />
        {{ t('common.addText') }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, inject, watch } from 'vue';
  import { CheckOutlined } from '@ant-design/icons-vue';
  import { Input } from 'ant-design-vue';
  import Icon from '/@/components/Icon';
  import TreeIcon from '/@/assets/svg/ontology/tree.svg';
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

  // whether to display input
  const showInput = ref<boolean>(false);
  watch(showInput, (newVal) => {
    changeShowEdit(newVal);
  });
  // get the input element
  const inputRef = ref<Nullable<HTMLElement>>(null);
  const additionValue = ref<string>('');
  // input out of focus event
  const onBlur = () => {
    setTimeout(() => {
      // handleDelete();
    }, 500);
  };

  const handleAdd = () => {
    showInput.value = true;
    setTimeout(() => {
      inputRef.value!.focus();
    }, 200);
  };

  const handleSave = () => {
    const value = unref(additionValue.value);
    props.handleSet &&
      props.handleSet({
        setType: 'add',
        setValue: props.type === 'attributes' ? attributeFactory(value) : optionFactory(value),
      });

    handleDelete();

    if (props.type === 'attributes') {
      // If it is AttrForm , enter immediately
      const length = props.dataSchema[props.type].length;
      handleGo(length - 1);
    } else {
      // If it is Options , hide the verification information
      emits('update:showRequired', false);
    }
  };

  const handleDelete = () => {
    additionValue.value = '';
    showInput.value = false;
  };

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

  // Determine if record has children
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
