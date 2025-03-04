import { computed, ref } from 'vue';
import { OPType } from 'image-editor';
import { useInjectBSEditor } from '../../context';
import { StageTypeEnum } from '../../type';
import * as api from '../../api';

const stageNameMap: Record<StageTypeEnum, any> = {
  [StageTypeEnum.annotate]: 'titleAnnotate',
  [StageTypeEnum.review]: 'titleReview',
  [StageTypeEnum.acceptance]: 'titleAcceptance',
  [StageTypeEnum.quality]: 'titleQA',
  [StageTypeEnum.view]: 'titleView',
  [StageTypeEnum.modify]: 'titleModify',
};
export default function useStageInfo() {
  const editor = useInjectBSEditor();
  const { bsState, state } = editor;
  const workflowItemId = ref('');

  async function getWorkFlowData() {
    const itemId = editor.getTaskFrameId();
    const workflow = bsState.workFlowData[itemId];
    if (workflow || !bsState.taskId || !itemId) return;
    const params = {
      taskId: bsState.taskId as string,
      itemId,
    };
    bsState.workFlowData[itemId] = await api.getItemFlow(params);
  }
  async function getRejectData() {
    const itemId = editor.getTaskFrameId();
    let rejectInfo = bsState.rejectData[itemId];
    if (rejectInfo || !bsState.taskId || !itemId) return;
    const params = {
      taskId: bsState.taskId as string,
      itemId,
    };
    rejectInfo = await api.getRejectInfo(params);
    bsState.rejectData[itemId] = rejectInfo.sort((a: any, b: any) => {
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
    const stageId: any = bsState.stageId || bsState.stage.id;
    if (rejectInfo?.length > 0 && rejectInfo[0].toStageId == stageId) {
      workflowItemId.value = itemId;
    }
  }

  const stageInfo = computed(() => {
    const type = bsState.query.stageType as StageTypeEnum;
    const isEditOpType = state.modeConfig.op === OPType.EDIT;
    let stageName = '';
    let stageType = type;
    if ([StageTypeEnum.review, StageTypeEnum.acceptance].includes(type) && isEditOpType) {
      stageType = StageTypeEnum.modify;
    }
    stageName = editor.tI(stageNameMap[stageType]);
    return {
      stageName,
      stageType,
      stages: bsState.stages,
    };
  });
  const workflowInfo = computed(() => {
    const id = editor.getTaskFrameId();
    const workflowInfo = bsState.workFlowData[id];
    return workflowInfo;
  });
  const rejectInfo = computed(() => {
    const id = editor.getTaskFrameId();
    const rejectInfo = bsState.rejectData[id];
    return rejectInfo;
  });
  async function updateFlowInfo() {
    if (!bsState.isTaskFlow) return;
    const frame = editor.getCurrentFrame();
    if (!frame) return;
    await getWorkFlowData();
    getRejectData();
  }
  return {
    stageInfo,
    workflowInfo,
    rejectInfo,
    workflowItemId,
    updateFlowInfo,
  };
}
