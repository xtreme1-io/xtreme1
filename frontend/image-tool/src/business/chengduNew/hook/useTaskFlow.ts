import * as api from '../api';
import { BSError, OPType, ToolModelEnum } from 'image-editor';
import { useInjectBSEditor } from '../context';
import * as utils from '../utils';
import useClaim from './useClaim';
import useUrl from './useUrl';
import { StageEnum, StageTypeEnum, TaskClaimPool, TaskClaimStatus, TaskStatusEnum } from '../type';
import Event from '../config/event';
import useUI from './useUI';
import { t } from '@/lang';

export default function useTaskFlow() {
  const editor = useInjectBSEditor();
  const { bsState, state } = editor;
  const { getClaimInfo, initClaimInfo } = useClaim();
  const { updateUrl } = useUrl();
  const { canEdit } = useUI();

  // window.updateUrl = updateUrl;

  async function getStageInfo() {
    if (bsState.stageId) {
      const stage = await api.getTaskStageInfo(bsState.stageId);
      bsState.stage = stage;
    }
  }

  async function getAllStageInfo() {
    const stages = await api.getAllTaskStageInfo(bsState.taskId);
    bsState.stages = stages;
  }

  async function getSeriesFrames() {
    const ids = await api.getTaskSceneData(bsState.taskId, state.sceneId);
    if (ids.length === 0) throw new BSError('', t('image.no-data'));
    editor.setFrameFromIds(ids);
  }

  async function getPreStage() {
    if (bsState.isVisitorClaim) return;
    const stages = await api.getTaskPreStage(bsState.taskId, bsState.stageId);
    bsState.preStages = stages;
  }

  async function getTaskInfo() {
    const { bsState, state } = editor;
    const { config } = state;
    const task = await api.getTaskInfo(bsState.taskId);
    bsState.task = task;
    bsState.datasetId = task.datasetId;
    state.isSeriesFrame = task.itemType === 'SCENE';

    // 实例分割初始值
    state.ToolModeList = task.annotationType || [ToolModelEnum.INSTANCE];
    state.imageToolMode = state.ToolModeList[0];
    // 图片绘制限制
    config.limitPosition = !task.toolLimitConf.allowExceedAreas;
    // 单个结果能否存在于多个组内
    config.allObjectInMultipleGroups = task.toolLimitConf.allowGroups;
    // 辅助线配置
    const {
      imageList,
      enableDistanceMeasure,
      measureToolColor,
      enableMeasureLine,
      measureLineConfig,
    } = task.distanceMeasureConf;
    if (enableMeasureLine && measureLineConfig) {
      config.helperLine.lineColor = measureLineConfig.color || '#ffffff';
    }
    if (enableDistanceMeasure) {
      measureToolColor && (config.helperLine.toolColor = measureToolColor);
      if (imageList && imageList.length > 0) {
        const defaultCfg = imageList[0];
        const { width = 0, height = 0, radius = 0, type } = defaultCfg;
        let isCircle = type === 'circle';
        config.helperLine.radius = isCircle ? 1 : 0;
        config.helperLine.width = radius * 2 || width;
        config.helperLine.height = radius * 2 || height;
        config.helpLineConfig = imageList.map((e) => {
          isCircle = e.type === 'circle';
          return {
            name: e.name,
            radius: isCircle ? 1 : 0,
            width: isCircle ? e.radius : e.width,
            height: isCircle ? e.radius : e.height,
          };
        });
      }
    }
    // 等分线配置
    const { enableEquisector, equisectorConfig } = task.toolLimitConf;
    if (enableEquisector) {
      const { horizontal = 2, vertical = 2, width = 1, color = '#b3e08fb3' } = equisectorConfig;
      Object.assign(state.config.bisectrixLine, { horizontal, vertical, width, color });
    }
  }

  async function getTaskClassifications() {
    const { bsState } = editor;
    const classifications = await api.getTaskClassifications(bsState.taskId);
    bsState.classifications = classifications;
  }
  async function getTaskClasses() {
    const { bsState } = editor;
    const config = await api.getTaskClasses(bsState.taskId);
    editor.setClassTypes(config);
  }

  async function initStageFrames() {
    const { state, bsState } = editor;
    const { user } = bsState;

    const ids = bsState.query.itemIds || [];
    const statusInfos = await api.getTaskDataStatus(ids, bsState.taskId);
    // statusInfos.reduce((map, item) => {
    //     map[item.itemId] = item.status as any;
    //     return map;
    // }, bsState.statusMap);
    statusInfos.forEach((item) => {
      if (state.isSeriesFrame) {
        bsState.sceneInfoCache[item.itemId] = { name: item.name };
      }
    });
    const filterItems = statusInfos
      .filter((e) => {
        return bsState.isVisitorClaim || (e.stageId == bsState.stageId && e.workerId == user.id);
      })
      .map((e) => e.itemId);
    if (filterItems.length === 0) {
      reClaimDataConfirm();
      throw new BSError('', t('image.no-valid-data'));
    }

    // 连续帧
    if (state.isSeriesFrame) {
      state.sceneIds = filterItems;
    } else {
      editor.setFrameFromIds(filterItems);
    }
  }

  async function initNoStageFrames(isQA?: boolean) {
    const { state, bsState } = editor;
    const { user } = bsState;
    let ids: string[] = [];
    if (bsState.query.itemIds) {
      ids = utils.parseUrlIds(bsState.query.itemIds || '');
    } else {
      ids = await api.getAccLockItems(bsState.task.id, bsState.user.id);
    }
    if (!ids || ids.length <= 0) {
      return await autoNextClaim(StageEnum.NEED_ACCEPTANCE);
    }
    let statusInfos = await api.getTaskDataStatus(ids, bsState.taskId);
    if (!isQA && !bsState.isVisitorClaim) {
      statusInfos = statusInfos.filter(
        (e) => e.status === TaskStatusEnum.NEED_ACCEPTANCE && e.workerId === user.id,
      );
    }
    editor.dataManager.setTaskDataInfo(statusInfos);
    const filterItems = statusInfos.map((e) => e.itemId);
    if (filterItems.length === 0) {
      reClaimAccDataConfirm();
      throw new BSError('', t('image.no-valid-data'));
    }

    // 连续帧
    if (state.isSeriesFrame) {
      statusInfos.forEach((item) => {
        bsState.sceneInfoCache[item.itemId] = { name: item.name };
      });
      state.sceneIds = filterItems;
    } else {
      editor.setFrameFromIds(filterItems);
    }
  }

  async function loadTaskData() {
    if (state.isSeriesFrame) {
      await editor.loadManager.loadSceneData(0);
    } else {
      await editor.loadFrame(0, false, true);
    }
  }

  async function submitData(param: { stage?: StageEnum; exit?: boolean }) {
    if (bsState.doing.submitting) return;
    bsState.doing.submitting = true;

    const config = {
      itemId: editor.getTaskFrameId(),
      taskId: bsState.task.id,
      stageId: bsState.stageId,
      claimRecordId: bsState.claimRecordId,
    };
    editor.showLoading(true);
    try {
      // before submit: save
      await beforeFlowAction(true, true);
      await api.taskSubmit(config);
      editor.showMsg('success', t('image.success-submit'));
      bsState.doing.submitting = false;
      // after submit: exit or autoClaim
      await afterFlowAction(param);
    } catch (error) {
      editor.handleErr(error);
      throw error;
    } finally {
      bsState.doing.submitting = false;
      editor.showLoading(false);
    }
  }
  async function acceptanceAccept() {
    if (bsState.doing.accepting) return;
    bsState.doing.accepting = true;

    try {
      // before acc
      await beforeFlowAction(state.modeConfig.op === OPType.EDIT);

      await api.taskAcceptanceAccept(bsState.taskId, editor.getTaskFrameId());
      editor.showMsg('success', t('image.success-accept'));
      // after acc
      bsState.doing.accepting = false;
      await afterFlowAction({ stage: StageEnum.NEED_ACCEPTANCE });
    } catch (error) {
      bsState.doing.accepting = false;
      editor.handleErr(error);
      throw error;
    }
  }
  /** revise */
  async function reviseTask(data: any) {
    try {
      await api.taskRevise({
        taskId: bsState.taskId,
        itemId: editor.getTaskFrameId(),
        reason: data.reason,
        toStageId: data.stage,
      });
      if (state.isSeriesFrame) {
        let { sceneIds } = state;
        const curIndex = Math.max(0, sceneIds.indexOf(state.sceneId));
        sceneIds = sceneIds.filter((item) => item != state.sceneId);
        state.sceneIds = sceneIds;
        if (sceneIds.length > 0) {
          await updateUrl();
          await editor.loadManager.loadSceneData(curIndex % sceneIds.length);
        } else {
          utils.closeTab();
        }
      } else {
        const { frames, frameIndex } = state;
        const curFrame = frames[frameIndex];
        const filterFrames = frames.filter((e) => e.id !== curFrame.id);
        editor.clearFrames(curFrame);
        if (filterFrames.length > 0) {
          editor.setFrames(filterFrames);
          await updateUrl();
          await editor.loadFrame(frameIndex % filterFrames.length, true, true);
        } else {
          utils.closeTab();
        }
      }
    } catch (err: any) {
      editor.handleErr(err);
    }
  }

  async function getSampleInfo() {
    if (bsState.sampleId && state.isSeriesFrame) {
      let sampleIds = await api.getTaskSampleInfo(
        bsState.taskId,
        state.sceneId,
        bsState.query.sampleId,
      );
      sampleIds = sampleIds || [];
      const sampleMap: Record<string, boolean> = {};
      sampleIds.forEach((e) => {
        sampleMap[e] = true;
      });
      sampleIds.forEach((id) => {
        const frame = editor.getFrame(id);
        if (frame) {
          frame.isSample = true;
        }
      });
      editor.emit(Event.SAMPLE_LOADED);
    }
  }
  async function suspendData(stage: StageEnum) {
    if (bsState.doing.suspending) return;
    bsState.doing.suspending = true;
    try {
      if (canEdit()) {
        await editor.saveTaskFlow();
      }
      const itemId = editor.getTaskFrameId();
      await api.taskSuspend(bsState.task.id, bsState.stage.id, bsState.claimRecordId, [itemId]);
      editor.clearResource({ clearComment: true });
      await autoNextClaim(stage);
      if (state.isSeriesFrame) {
        bsState.query.itemIds = state.sceneIds;
      } else {
        bsState.query.itemIds = state.frames.map((e) => e.id);
      }
      updateUrl(false);
    } catch (error: any) {
      editor.handleErr(error);
      bsState.doing.suspending = false;
    }
    bsState.doing.suspending = false;
  }
  async function rejectData(exit: boolean) {
    if (bsState.doing.rejecting) return;
    bsState.doing.rejecting = true;

    const { preStages, stage } = bsState;
    if (preStages.length === 0) return;

    let rejectData;
    try {
      rejectData = await editor.showModal('reject', {
        title: t('image.title-reject'),
        data: { stages: preStages, toStageId: preStages[0].id },
      });
    } catch (error) {
      rejectData = undefined;
      console.log(error);
    }

    if (!rejectData) {
      bsState.doing.rejecting = false;
      return;
    }

    try {
      // before reject
      await beforeFlowAction();
      const config = {
        claimRecordId: bsState.claimRecordId,
        itemId: editor.getTaskFrameId(),
        taskId: bsState.task.id,
        fromStageId: stage.id,
        ...rejectData,
      };
      await api.taskReviewReject(config);
      // after reject
      bsState.doing.rejecting = false;
      await afterFlowAction({ exit, stage: StageEnum.REVIEW });
    } catch (error) {
      bsState.doing.rejecting = false;
      editor.handleErr(error);
      throw error;
    }
  }

  async function acceptanceReject() {
    if (bsState.doing.rejecting) return;
    bsState.doing.rejecting = true;

    const { stages } = bsState;
    if (stages.length === 0) return;

    let rejectData;
    try {
      rejectData = await editor.showModal('reject', {
        title: t('image.title-reject'),
        data: { stages: stages, toStageId: stages[0].id },
      });
    } catch (error) {
      console.log(error);
    }

    if (!rejectData) {
      bsState.doing.rejecting = false;
      return;
    }

    try {
      // before
      await editor.reportWorkTime();
      const config = {
        claimRecordId: bsState.claimRecordId,
        itemId: editor.getTaskFrameId(),
        taskId: bsState.task.id,
        ...rejectData,
      };
      await api.taskAcceptanceReject(config);
      bsState.doing.rejecting = false;
      await afterFlowAction({ stage: StageEnum.NEED_ACCEPTANCE });
    } catch (error) {
      bsState.doing.rejecting = false;
      editor.handleErr(error);
      throw error;
    }

    return true;
  }

  // 领取数据(标注/审核阶段的数据)
  async function claimData(isReclaim = false) {
    editor.showLoading({
      type: 'loading',
      content: t('image.title-claiming'),
    });
    let list: any[] = [];
    const reClaimConfirm = async () => {
      const hasClaimAll = editor.bsState.claimAnnotators.filter((e) => e != 'ALL').length <= 0;
      let stage: any;
      switch (bsState.query.stageType) {
        case StageTypeEnum.annotate:
          stage = StageEnum.ANNOTATION;
          break;
        case StageTypeEnum.review:
          stage = StageEnum.REVIEW;
          break;
        default:
          break;
      }
      if (stage && !hasClaimAll) {
        return await autoNextClaim(stage);
      } else {
        return await reClaimDataConfirm();
      }
    };
    try {
      let data = await api.taskClaim(
        bsState.stage.id,
        bsState.taskId,
        bsState.claimAnnotators.filter((e) => e != 'ALL'),
        bsState.claimPool,
      );
      const { stageId } = data.data;
      if (stageId !== bsState.stageId) {
        bsState.stageId = bsState.query.stageId = stageId;
        await getStageInfo();
        await getPreStage();
      }
      const claimId = data.data.id;
      bsState.claimRecordId = claimId;
      data = await api.getTaskClaimInfo(claimId);
      list = data.data.list || [];
      if (isReclaim) {
        const itemIds = bsState.query.itemIds || [];
        if (itemIds.every((id: any) => list.some((e) => e.itemId == id))) {
          editor.blockEditor(false);
          updateUrl();
          await getClaimInfo();
          return;
        }
      }
    } catch (error: any) {
      editor.showLoading(false);
      await reClaimConfirm();
      throw error;
    }

    if (list.length === 0) {
      editor.showLoading(false);
      return await reClaimConfirm();
    }
    editor.showMsg('success', t('image.claimed-num-data', { num: list.length }));
    try {
      editor.clearFrames();
      if (state.isSeriesFrame) {
        state.sceneIds = list.map((e: any) => e.itemId);
        await updateUrl();
        await editor.loadManager.loadSceneData(0);
      } else {
        const ids = list.map((e: any) => e.itemId);
        editor.setFrameFromIds(ids);
        await updateUrl();
        await editor.loadFrame(0, true, true);
      }
      await getClaimInfo();
    } catch (error) {
      editor.showLoading(false);
      editor.handleErr(error);
      throw error;
    }
    editor.showLoading(false);
  }
  // 领取数据(验收阶段的数据)
  async function claimAccData(size?: number) {
    editor.showLoading({
      type: 'loading',
      content: t('image.title-claiming'),
    });
    let list = [];
    try {
      size = size || editor.bsState.claimNum;
      const data = await api.taskClaimAccData(bsState.taskId, size);
      list = data.data || [];
    } catch (error) {
      editor.showLoading(false);
      reClaimAccDataConfirm();
      throw error;
    }
    if (list.length === 0) {
      editor.showLoading(false);
      reClaimAccDataConfirm();
      return;
    }
    editor.showMsg('success', t('image.claimed-num-data', { num: list.length }));
    try {
      editor.clearFrames();
      if (state.isSeriesFrame) {
        state.sceneIds = list;
        await updateUrl();
        await editor.loadManager.loadSceneData(0);
      } else {
        editor.setFrameFromIds(list);
        await updateUrl();
        await editor.loadFrame(0, true, true);
      }
    } catch (error) {
      editor.showLoading(false);
      editor.handleErr(error);
      throw error;
    }
    editor.showLoading(false);
  }

  // annotate review accept阶段自动领取
  async function autoNextClaim(stage: StageEnum) {
    const claimConfirm = async () => {
      await getClaimInfo();
      const status = bsState.claim?.status;
      let action: boolean = true;
      const isStageAcc = stage == StageEnum.NEED_ACCEPTANCE;
      if (
        isStageAcc ||
        (status && [TaskClaimStatus.DONE, TaskClaimStatus.TIMEOUT].includes(status))
      ) {
        action = await editor
          .showModal('ClaimConfirm', {
            title: t('image.Claim Data'),
            data: {
              disableClaim: isStageAcc,
              content: isStageAcc ? t('image.msgFinishAccTask') : t('image.continueClaimTips'),
              withAnnotator: bsState.stage.type === 'REVIEW',
            },
            maskClosable: false,
            closable: false,
            banOther: true,
            zIndex: 1003,
          })
          .then(
            () => true,
            () => false,
          );
      }
      if (action) {
        await reClaimData(stage);
      } else {
        editor.state.frames.forEach((f) => (f.needSave = false));
        utils.closeTab();
      }
    };

    if (state.isSeriesFrame) {
      let { sceneId, sceneIds } = state;
      const curIndex = Math.max(0, sceneIds.indexOf(sceneId));
      sceneIds = sceneIds.filter((item) => item != sceneId);
      state.sceneIds = sceneIds;
      if (sceneIds.length > 0) {
        await editor.loadManager.loadSceneData(curIndex % sceneIds.length);
      } else {
        await claimConfirm();
      }
    } else {
      const { frames, frameIndex } = state;
      const curFrame = frames[frameIndex];
      const filterFrames = frames.filter((e) => e.id !== curFrame.id);
      editor.clearFrames(curFrame);
      if (filterFrames.length > 0) {
        editor.setFrames(filterFrames);
        await editor.loadFrame(frameIndex % filterFrames.length, true, true);
      } else {
        await claimConfirm();
      }
    }
  }

  async function reClaimData(stage: StageEnum) {
    switch (stage) {
      case StageEnum.ANNOTATION:
      case StageEnum.REVIEW: {
        await claimData();
        // await reClaimDataConfirm();
        break;
      }
      case StageEnum.NEED_ACCEPTANCE: {
        await claimAccData();
        // await reClaimAccDataConfirm();
        break;
      }
    }
  }

  async function reClaimDataConfirm() {
    const preMap: Record<string, any> = {
      [TaskClaimPool.NORMAL]: t('image.msgNormalCompleted'),
      [TaskClaimPool.REJECTED]: t('image.msgRejectedCompleted'),
      [TaskClaimPool.RE_REVIEW]: t('image.msgReReviewCompleted'),
      [TaskClaimPool.SUSPENDED]: t('image.msgSuspendCompleted'),
    };
    const preMsg = preMap[bsState.claimPool] ?? preMap[TaskClaimPool.NORMAL];
    editor
      .showModal('ClaimConfirm', {
        title: t('image.No data available for now'),
        data: {
          content: t('image.reClaimTips', { pre: preMsg }),
        },
        maskClosable: false,
        closable: false,
        banOther: true,
        zIndex: 1003,
      })
      .then(
        () => {
          bsState.claimPool = TaskClaimPool.NORMAL;
          claimData();
        },
        () => {
          utils.closeTab();
        },
      );
  }
  async function reClaimAccDataConfirm() {
    editor
      .showModal('AccClaim', {
        title: t('image.You have completed all claimed data'),
        maskClosable: false,
        closable: false,
        banOther: true,
        zIndex: 1003,
      })
      .then(
        (num) => {
          claimAccData(num);
        },
        () => {
          utils.closeTab();
        },
      );
  }

  /**
   * 流程操作后的执行
   * @param needSave: 是否保存(默认true)
   * @param needQA: 是否需要质检
   */
  async function beforeFlowAction(needSave: boolean = true, needQA: boolean = false) {
    await editor.reportWorkTime();
    needSave && (await editor.save());
    needQA && (await qualityBeforeSubmit());
  }
  /**
   * 流程操作后的执行
   * @param exit: 是否退出(默认false,自动领取下一个)
   */
  async function afterFlowAction(param: { stage?: StageEnum; exit?: boolean }) {
    if (param.exit) {
      utils.closeTab();
    } else if (param.stage) {
      editor.clearResource({ clearComment: true });
      await autoNextClaim(param.stage);
    } else {
      editor.beforeRefresh();
      utils.refreshTab();
    }
  }
  async function qualityBeforeSubmit() {
    const params: any = {
      isTransferResult: false,
      isOnlyDetectMandatoryRules: true,
      datasetId: bsState.datasetId,
      taskId: bsState.taskId,
    };
    if (state.isSeriesFrame) {
      params.sceneIds = [state.sceneId];
      params.dataIds = state.frames.map((e) => e.id);
    } else {
      const frame = editor.getCurrentFrame();
      params.dataIds = [frame.id];
    }

    const data = await api.queryQaResultRealtime(params);
    if (data?.isMandatoryRulesViolated === true) {
      editor.showQualityModal({ data: data, visible: true });
      const err = new BSError('', 'The results that have not passed QA !');
      editor.handleErr(err);
      throw err;
    }
  }

  return {
    getPreStage,
    getStageInfo,
    getAllStageInfo,
    getTaskInfo,
    getTaskClassifications,
    getTaskClasses,
    getSeriesFrames,
    initStageFrames,
    initNoStageFrames,
    initClaimInfo,
    loadTaskData,
    submitData,
    suspendData,
    rejectData,
    acceptanceAccept,
    acceptanceReject,
    reviseTask,
    getSampleInfo,
    claimData,
  };
}
