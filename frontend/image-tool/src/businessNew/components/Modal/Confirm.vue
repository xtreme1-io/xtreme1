<template>
  <div class="modal-confirm-base" style="padding-left: 40px">
    <div class="msg" v-show="data.content"> {{ data.content }}</div>
    <div class="sub-msg" v-show="data.subContent"> {{ data.subContent }}</div>
    <div style="margin-top: 20px; text-align: right">
      <a-button
        class="btn"
        v-for="btn in props.data.buttons"
        :key="btn.action"
        v-bind="btn"
        @click="onClick(btn)"
      >
        {{ editor.lang(btn.content as any) || btn.content }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { IConfirmProps, IConfirmBtn } from '../../configs/ui';
  import { useInjectBSEditor } from '../../context';

  // ***************Props and Emits***************
  const emit = defineEmits(['cancel', 'ok']);
  const editor = useInjectBSEditor();
  const props = withDefaults(
    defineProps<{
      data: IConfirmProps;
    }>(),
    {
      data: () => {
        return {
          content: '',
          subContent: '',
          buttons: [],
        };
      },
    },
  );
  // ***************Props and Emits*************
  let action = '';
  function onClick(item: IConfirmBtn) {
    action = item.action;
    emit('ok');
  }

  function valid(): Promise<boolean> {
    return Promise.resolve(true);
  }
  function onCancel() {
    emit('cancel');
  }

  function getData(): any {
    return action;
  }

  defineExpose({
    valid,
    getData,
  });
</script>

<style lang="less">
  .modal-confirm-base {
    .btn {
      margin-right: 10px;
      min-width: 80px;
      height: 30px;
    }

    .msg {
      font-size: 16px;
      line-height: 32px;
    }

    .sub-msg {
      font-size: 14px;
      line-height: 24px;
      color: #bec1ca;
    }

    .btn.ghost-gray {
      border-color: #cccccc;
      color: #cccccc;

      &:hover {
        border-color: fade(#cccccc, 80%);
        color: fade(#cccccc, 80%);
      }
    }

    .btn.ghost-red {
      border-color: #f8827b;
      color: #f8827b;

      &:hover {
        border-color: fade(#f8827b, 80%);
        color: fade(#f8827b, 80%);
      }
    }
  }
</style>
