import { CommentTabEnum } from './config/comment';
import { IBSState, ICommentState, IGlobalConfig, IQAState, TaskClaimPool } from './type';
import { __ALL__ } from 'image-editor';

// export const ALL = '__ALL__';

export function getDefault(): IBSState {
  return {
    query: {},
    user: {} as any,
    team: {} as any,
    config: {} as IGlobalConfig,
    doing: {
      saving: false,
      suspending: false,
      submitting: false,
      rejecting: false,
      accepting: false,
    },
    datasetId: '',
    blocking: false,
    recordId: '',
    taskId: '',
    sampleId: '',
    stageId: '',
    claimRecordId: '',
    claimNum: 5,
    claimPool: TaskClaimPool.NORMAL,
    // current seriesFrame
    classifications: [],
    stages: [],
    preStages: [],
    task: {} as any,
    stage: {} as any,
    isModify: false,
    remainTime: 10000,
    // activeSource: [__ALL__],
    activeSource: ['-1'],
    currentSource: '-1',
    commentState: getCommentDefault(),
    // qa
    qa: getQADefault(),
    // flow
    workFlowData: {},
    rejectData: {},

    // fitler
    // ALL: ALL,
    filterClasses: [__ALL__],
    filterTools: [__ALL__],
    sceneInfoCache: {},
    annotatorList: [],
    claimAnnotators: [],
  };
}
function getCommentDefault(): ICommentState {
  return {
    activeTab: CommentTabEnum.OPEN,
    loading: false,
    activeKey: [],
    list: [],
    commentNumber: 0,
    filterObj: {
      createdBy: 'All',
      stageName: ['All'],
      types: ['All'],
    },
  };
}
function getQADefault(): IQAState {
  return {
    dataSource: [],
    objectSource: [],
    ruleConfig: {},
    activeRow: '',
    activeTab: 'object',
    loading: false,
    version: -1,
    visible: false,
    executed: false,
    hasError: false,
  };
}
