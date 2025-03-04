<template>
  <div class="modal-confirm-base" style="padding-left: 20px">
    <!-- <title> No data available for now </title> -->
    <div class="msg">
      {{ data.content }}
      <div style="padding-top: 24px" v-if="data.withAnnotator">
        <span> {{ t('image.titleAnnotator') }} </span>
        <a-select
          v-model:value="editor.bsState.claimAnnotators"
          mode="multiple"
          showArrow
          :placeholder="t('image.noneText')"
          :maxTagCount="1"
          :maxTagTextLength="6"
          optionFilterProp="name"
          style="margin-left: 10px; width: 200px"
          :fieldNames="{ label: 'name' }"
          :options="editor.bsState.annotatorList"
          @deselect="onDeselect"
          @select="onSelect"
        >
        </a-select>
      </div>
    </div>
    <div class="confirm-btns">
      <a-button class="btn" @click="onClose()"> {{ t('image.Close') }} </a-button>
      <a-button v-if="data.disableClaim !== true" class="btn" type="primary" @click="onClick()">
        {{ t('image.Re-Claim') }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useInjectBSEditor } from '../../context';
  import { t } from '@/lang';

  // ***************Props and Emits***************
  const emit = defineEmits(['cancel', 'ok']);
  const ALL = 'ALL';
  defineProps<{
    data: {
      disableClaim?: boolean;
      content: string;
      withAnnotator?: boolean;
    };
  }>();
  const editor = useInjectBSEditor();
  onMounted(() => {
    editor.businessManager.loadAnnotators(true);
  });
  function onClick() {
    emit('ok');
  }

  function onClose() {
    emit('cancel');
  }

  /**
   * defineExpose
   */
  function valid(): Promise<boolean> {
    return Promise.resolve(true);
  }
  function getData(): any {
    return 'ClaimConfirm';
  }
  function onDeselect(value: string) {
    if (value == ALL) {
      editor.bsState.claimAnnotators = [];
    }
  }
  function onSelect(value: string) {
    if (value == ALL) {
      editor.bsState.claimAnnotators = [ALL];
    } else {
      editor.bsState.claimAnnotators = editor.bsState.claimAnnotators.filter((e) => e != ALL);
    }
  }
  defineExpose({
    valid,
    getData,
  });
</script>

<style lang="less" scoped>
  .confirm-btns {
    display: flex;
    margin-top: 20px;
    justify-content: end;
    flex-direction: row;
  }
</style>
