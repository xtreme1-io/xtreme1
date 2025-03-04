<template>
  <div>
    <a-button
      v-show="!editor.state.isHistoryView"
      :class="['btn-qa', qaStatus()]"
      @click="onQaVisible"
    >
      <template #icon>
        <LoadingOutlined v-if="qaState.loading" />
        <IconDetection v-else />
      </template>
      {{ 'QA' }}
    </a-button>
    <teleport to="body">
      <QaModal
        v-model:visible="qaState.visible"
        v-model:activeRow="qaState.activeRow"
        v-model:activeTab="qaState.activeTab"
        :dataSource="qaState.dataSource"
        :objectSource="qaState.objectSource"
        :loading="qaState.loading"
        :locale="editor.state.lang"
        :showColumnCount="editor.state.isSeriesFrame"
        @action="onAction"
      >
        <template #header>
          {{ 'QA' }}
          <a-button
            size="small"
            type="primary"
            :disabled="qaState.loading"
            @mousedown.stop="() => {}"
            @click.stop="() => onAction(QaType.ActionType.RUN)"
            style="margin-left: 10px; border: none; background: #fdb022"
          >
            {{ qaState.executed ? 'Rerun' : 'Run' }}
            <RetweetOutlined />
          </a-button>
          <a-button
            size="small"
            v-if="qaState.loading"
            @mousedown.stop="() => {}"
            @click.stop="() => onAction(QaType.ActionType.STOP)"
            style="margin-left: 10px; border: none"
          >
            <template #icon>
              <PauseCircleOutlined />
            </template>
          </a-button>
        </template>
      </QaModal>
    </teleport>
  </div>
</template>

<script setup lang="ts">
  import { RetweetOutlined, PauseCircleOutlined, LoadingOutlined } from '@ant-design/icons-vue';
  import { QaModal, QaType } from '@basicai/tool-components';
  import { useInjectBSEditor } from '../../../context';
  import useQA from '../useQA';

  const editor = useInjectBSEditor();
  const { bsState } = editor;
  const qaState = bsState.qa;
  const { onAction, onQaVisible, qaStatus } = useQA();
</script>

<style lang="less" scoped>
  .btn-qa {
    display: flex;
    border: 0;
    border-radius: 4px;
    align-items: center;
    height: 32px;
    background: #fdb022;
    color: white;
    flex-direction: row;
    gap: 6px;
  }

  .running {
    background: #86affe;
  }

  .pass {
    background: #32d583;
  }

  .failed {
    background: #f97066;
  }
</style>
