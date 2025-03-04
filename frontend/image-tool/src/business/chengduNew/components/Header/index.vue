<template>
  <ToolHeader
    ref="refHeader"
    :langType="state.lang"
    :blocking="bsState.blocking"
    :data-info="dataInfo"
    :stage-info="stageInfo"
    :index-info="indexInfo"
    :workflow-info="workflowInfo"
    :reject-info="rejectInfo"
    :open-workflow-details="workflowItemId"
    :time-info="timerInfo"
    :status="status"
    :customMenuData="customMenuData"
    @onCloseHandler="onClose"
    @onReclaimHandler="onReClaim"
    @onPauseHandler="onPause"
    @onContinueHandler="onContinue"
    @onTimeoutHandler="updateClaimInfo"
    @onFlowindexHandler="onIndex"
    @onHelpHandler="onHelp"
    @onFlowActionHandler="onFlowAction"
    @onModifyHandler="onModify"
    @onReviseHandler="onRevise"
    @onReportIssueHandler="issueHandler"
  >
    <template #right>
      <H.UI.ObjectSwitcher v-if="H.boolShowObjectSwitcher()" />
      <H.UI.BtnHistory v-if="H.boolShowBtnHistoryBack()" />
      <H.UI.BtnRestore v-if="H.boolShowBtnRestore()" :disabled="!H.UI.state.activeItem" />
      <!-- QA组件 -->
      <QAComponent v-if="has(BsUIType.btnQA)"></QAComponent>
    </template>
  </ToolHeader>
  <SampleMsg />
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import SampleMsg from './components/SampleMsg.vue';
  import QAComponent from './components/QAComponent.vue';

  import { BsUIType } from '../../config/ui';
  import { Event as EditorEvent } from 'image-editor';

  import { ToolHeader, HeaderTypes } from '@basicai/tool-components';
  import { HistoryOutlined } from '@ant-design/icons-vue';
  import { useInjectBSEditor } from '../../context';
  import useFlow from '../../hook/useFlow';
  import useUI from '../../hook/useUI';
  import useHeader from './useHeader';
  import useDataInfo from './useDataInfo';
  import useStageInfo from './useStageInfo';
  import useFlowIndex from './useFlowIndex';
  import useTaskTime from './useTaskTime';
  import { StageTypeEnum, TaskStatusEnum } from '../../type';
  import { historyStore } from '../../stores';
  import { vueMsg } from 'image-ui/utils';
  import { t } from '@/lang';
  const H = historyStore();
  //@ts-ignore
  globalThis._historyStore = H;
  const editor = useInjectBSEditor();
  const { bsState, state } = editor;
  const { has } = useUI();
  const { onClose, onHelp, onFlowAction, onModify, onRevise, issueHandler } = useHeader();
  const { updateDataInfo, dataInfo } = useDataInfo();
  const { updateFlowInfo, stageInfo, workflowInfo, rejectInfo, workflowItemId } = useStageInfo();
  const { timerInfo, onReClaim, onPause, onContinue, updateClaimInfo } = useTaskTime();
  const { indexInfo, onIndex } = useFlowIndex();
  const refHeader = ref<any>();
  const status = computed(() => {
    let stageAction;
    const type = bsState.query.stageType as StageTypeEnum;
    if (type === StageTypeEnum.annotate) stageAction = HeaderTypes.HeaderAction.submit;
    else if (type === StageTypeEnum.review) stageAction = HeaderTypes.HeaderAction.pass;
    if (type === StageTypeEnum.acceptance) stageAction = HeaderTypes.HeaderAction.accept;
    const dataId = editor.getTaskFrameId();
    const taskData = editor.dataManager.getTaskData(dataId);
    const isCompleted = taskData?.status === TaskStatusEnum.COMPLETED;
    return {
      showTaskTimer: state.frames?.length > 0 && !bsState.isVisitorClaim,
      showWorkflow: bsState.isTaskFlow && !state.isHistoryView,
      showSave: has(BsUIType.flowSave),
      showReject: has(BsUIType.flowReject),
      showModify: has(BsUIType.flowModify),
      showSubmit: has(BsUIType.flowSubmit) || has(BsUIType.flowPass) || has(BsUIType.flowAccept),
      showRevise: has(BsUIType.flowRevise) && isCompleted,
      showSuspend: has(BsUIType.flowSuspend),
      saving: bsState.doing.saving,
      suspending: bsState.doing.suspending,
      rejecting: bsState.doing.rejecting,
      submitting: bsState.doing.submitting || bsState.doing.accepting,
      isModify: bsState.isModify,
      showHelp: !state.isHistoryView,
      showReport: !state.isHistoryView,
      showToggle: !state.isHistoryView,
      showFullScreen: !state.isHistoryView,
      showMenuTool: !state.isHistoryView,
      showClose: !state.isHistoryView,
      showDataInfo: !state.isHistoryView,
      showStageInfo: !state.isHistoryView,
      stageAction,
    };
  });
  const customMenuData = computed(() => {
    return [
      {
        show: () => H.boolShowBtnHistory(),
        icon: () => HistoryOutlined,
        onClick() {
          H.UIOption.onHistory();
        },
        title: t('common.btnHistory'),
        key: 'history',
        sort: 1,
      },
    ];
  });

  const handler = useFlow();
  vueMsg(editor, EditorEvent.UPDATE_VIEW_MODE, () => {
    workflowItemId.value = '';
  });
  vueMsg(editor, EditorEvent.INIT, () => {
    handler?.init();
  });
  vueMsg(editor, EditorEvent.SHOW_REPORT, () => {
    refHeader.value?.showReport();
  });
  vueMsg(editor, EditorEvent.FRAME_CHANGE, () => {
    updateDataInfo();
    updateFlowInfo();
  });
</script>
