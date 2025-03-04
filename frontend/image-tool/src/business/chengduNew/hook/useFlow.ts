import * as pageHandler from '../pages';
import { setToken, setCurrentTask, setRequestLang } from '../api/base';
import { useInjectBSEditor } from '../context';
import Event from '../config/event';
import { closeTab, enableEscOnFullScreen } from '../utils';
import * as api from '../api';
import useQuery from './useQuery';
import useToken from './useToken';
import { KEY_TOKEN } from './useStorage';
import { computed, watch } from 'vue';
import {
  AnnotateObject,
  BSError,
  IAttr,
  IFrame,
  LangType,
  Skeleton,
  StatusType,
} from 'image-editor';
import { AppMode, IClassificationAttr, ISourceData } from '../type';
import { t } from '@/lang';

export type IHandlerType = keyof typeof pageHandler;

export default function UseFlow() {
  const editor = useInjectBSEditor();
  const { bsState, state } = editor;
  const { iniQuery } = useQuery();
  const token = useToken();

  // console.log('token:', token);
  // datasetId=30093&dataId=352734&type=readOnly

  iniQuery();

  const mode = getMode(); // 根据路径参数获取当前的模式
  if (!mode || !pageHandler[mode]) {
    editor.showMsg('error', 'invalid-query');
    return;
  }
  const handler = pageHandler[mode]();

  async function init() {
    editor.showLoading(true);
    if (!token) {
      editor.showMsg('error', 'Not logged in');
      return;
    }

    setToken(token); // 设置 Token
    setCurrentTask(bsState.taskId || '');

    try {
      await getUserInfo();
      await getGlobalConfig();
    } catch (error) {
      editor.showMsg('error', 'No user info');
      return;
    }
    getAuthority();

    initFlowEvent();
    handleUnload();
    enableEscOnFullScreen();

    editor.socketManager.init();
    editor.reportManager.init();
    await handler.init();
    if (bsState.isTaskFlow) {
      editor.updateUiAuth();
    }
    editor.emit(Event.BUSINESS_INIT);
  }

  function handleUnload() {
    window.addEventListener('beforeunload', (event: Event) => {
      if (editor.needSave() && !bsState.isVisitorClaim) {
        event.preventDefault();
        // @ts-ignore
        event.returnValue = t('image.SaveChanges');
      }
    });
  }

  function initFlowEvent() {
    editor.on(Event.FLOW_ACTION, async (action, data) => {
      if (bsState.blocking) return;
      if (checkVisitorAction(action)) return;
      // console.log('提交检测结果', checkFlowAction(action));
      checkFlowAction(action) && handler.onAction(action, data);
    });
    window.addEventListener('storage', async (event) => {
      const { key, newValue } = event;
      if (key === KEY_TOKEN) {
        if (token != newValue) {
          editor.autoSaveUtil.enableSave(false);
          await editor.showConfirm({
            title: t('image.Warning'),
            subTitle:
              'Something is wrong with your login status. Please refresh your page and try again.',
            okText: t('image.Close'),
            cancelButtonProps: {
              style: { display: 'none' },
            } as any,
          });
          editor.state.frames.forEach((f) => {
            f.needSave = false;
          });
          closeTab();
        }
      }
    });
  }
  // visitor action
  function checkVisitorAction(action: any) {
    const flowAction = [
      'save',
      'pause',
      'reject',
      'submit',
      'pass',
      'reject',
      'accept',
      'revise',
      'suspend',
    ];
    if (bsState.isVisitorClaim && flowAction.includes(action)) {
      editor.showMsg('warning', t('image.visitorTips'));
      return true;
    }
    return false;
  }

  // 提交/驳回/通过等流转流程的操作需要判断骨骼结果是否标注完整
  function checkFlowAction(action: any) {
    const flowAction = ['accept', 'submit', 'pass', 'reject'];
    const { bsState } = editor;
    if (!flowAction.includes(action) || !bsState.isTaskFlow) return true;
    editor.selectObject();
    let frameList = [];
    if (editor.state.isSeriesFrame) frameList = editor.state.frames;
    else frameList = [editor.getCurrentFrame()];
    let objects: AnnotateObject[] = [];
    frameList.forEach((frame) => {
      const arr = editor.dataManager.getFrameAllObject(frame.id) || [];
      objects = objects.concat(arr);
    });
    if (!bsState.task.toolLimitConf.allowSubmitUnCompletedSkeleton) {
      const skeList = objects.filter((obj) => obj instanceof Skeleton) as Skeleton[];
      const incompleteArr = skeList.filter((ske) => {
        return ske.points.findIndex((e) => !e.attrs.valid) !== -1;
      });
      if (incompleteArr.length > 0) {
        const results = incompleteArr.map((e) => e.userData.trackName).join(',');
        editor.showMsg('error', t('image.result-incomplete', { results }));
        return false;
      }
    }

    if (bsState.task.toolLimitConf.isNeedSubmitWithClass && action != 'reject') {
      const checkConfig = bsState.task.toolLimitConf.needSubmitWithClassType;
      let filters: AnnotateObject[] = [];
      if (checkConfig == 'NORMAL') filters = objects.filter((e) => !e.isGroup());
      else if (checkConfig == 'GROUP') filters = objects.filter((e) => e.isGroup());
      else filters = objects;
      const attrNeedList = filters.filter((e) => {
        const classCfg = editor.getClassType(e.userData.classId);
        if (classCfg) {
          const attrsValues = e.userData.attrs || {};
          const flag = checkAttrsRequiredWithoutValue(classCfg.attrs, attrsValues);
          return flag;
        }
        return true;
      });
      if (attrNeedList.length > 0) {
        const results = attrNeedList.map((e) => e.userData.trackName).join(',');
        editor.showMsg('error', t('image.result-need-attributes', { results }));
        return false;
      }
    }

    if (!bsState.task.toolLimitConf.allowExceedClassLimit) {
      const list = objects.filter((e) => e.userData.limitState);
      if (list.length > 0) {
        const results = list.map((e) => e.userData.trackName).join(',');
        editor.showMsg('error', t('image.result-exceedLimit', { results }));
        return false;
      }
    }

    const inValidClassificationsFrames = checkClassifications(frameList);
    if (inValidClassificationsFrames.length > 0) {
      let classificationErrTips = '';
      if (editor.state.isSeriesFrame) {
        let results = '';
        if (inValidClassificationsFrames.length > 30) {
          inValidClassificationsFrames.length = 30;
          results = inValidClassificationsFrames.join(',') + '...';
        } else results = inValidClassificationsFrames.join(',');
        classificationErrTips = t('image.Frame need classifications', { results });
      } else {
        classificationErrTips = t('image.data need classifications');
      }
      editor.showMsg('error', classificationErrTips);
      return false;
    }

    return true;
  }
  function checkAttrsRequiredWithoutValue(attrs: IAttr[], valMap: Record<string, any>): boolean {
    let invalid: boolean = false;
    const len = attrs.length;
    for (let i = 0; i < len; i++) {
      const attr = attrs[i];
      const value = valMap[attr.id]?.value || '';
      const invalidVal = !(value?.length > 0);
      // 必填项, 但是没有值
      if (attr.required && invalidVal) return true;
      if (!invalidVal && attr.options.length > 0) {
        let optionsAttrs: IAttr[] = [];
        attr.options.forEach((op) => {
          if (value.indexOf(op.name) !== -1) {
            optionsAttrs = optionsAttrs.concat(op.attributes || []);
          }
        });
        invalid = checkAttrsRequiredWithoutValue(optionsAttrs, valMap);
      }
      if (invalid) return invalid;
    }
    return invalid;
  }
  function checkClassifications(frames: IFrame[]) {
    const inValidFrames: number[] = []; // classification不合法的帧的index索引
    if (!frames || frames.length === 0) return inValidFrames;
    frames.forEach((frame) => {
      // const sourceData = frame.sourceData['-1'];
      const sourceData = editor.dataManager.getSourceData(frame, '-1') as ISourceData;
      const invalidAttrs = checkClassificationValue(sourceData) || [];
      if (invalidAttrs.length === 0) return;
      inValidFrames.push(editor.getFrameIndex(frame.id) + 1);
    });
    return inValidFrames;
  }
  function checkClassificationValue(sourceData: ISourceData) {
    let invalidList: IClassificationAttr[] = [];
    if (!sourceData) return invalidList;
    const list = sourceData.classifications;
    if (!list || list.length === 0) return invalidList;
    list.forEach((e) => {
      (e.attrs || []).forEach((attr) => {
        // required but no value or value.length == 0
        if (attr.required && (!attr.value || attr.value.length == 0)) invalidList.push(attr);
      });
    });
    // 只保留无父节点的属性 或者 父节点是上级属性的值的 invalid attr
    invalidList = invalidList.filter((attr) => {
      const parentVal = attr.parent?.value || ''; // 上级属性的值
      return !attr.parent || parentVal.indexOf(attr.parentValue || '') != -1;
    });
    return invalidList;
  }

  // 获取用户信息
  async function getUserInfo() {
    const res = await api.getUserInfo();
    editor.bsState.user = res.user;
    editor.bsState.team = res.team;
    // 设置语言
    editor.setLang(LangType[res.user.language as LangType] || LangType['en-US']);
    setRequestLang(editor.state.lang);

    // 设置ARMS监控的uid
    window.__bl?.setConfig?.({ uid: res.user?.id });
  }
  // 获取全局的配置信息
  async function getGlobalConfig() {
    const res = await api.getGlobalConfig();
    editor.bsState.config = res;
    if (!res?.hideLogo) {
      const iconLink = document.head.querySelector('link[rel=icon]') as HTMLLinkElement;
      const ico = res?.runningMode === AppMode.China ? 'favicon-CHINA.ico' : 'favicon-GLOBAL.ico';
      const iconUrl = import.meta.env.BASE_URL + ico;
      iconLink && (iconLink.href = iconUrl);
      const eleTitle = document.head.querySelector('title') as HTMLTitleElement;
      eleTitle && (eleTitle.innerText += ' - Basic AI');
    }
  }
  //  获取权限信息
  async function getAuthority() {
    if (editor.bsState.config.runningMode !== 'onprem') return;
    try {
      await api.getAuthorityConfig();
    } catch (error) {
      throw new BSError('', 'load authority config error', error);
    }
  }

  function getMode(): IHandlerType | undefined {
    const query = bsState.query;
    let mode = undefined as IHandlerType | undefined;

    if (
      (query.hasOwnProperty('classIds') || query.hasOwnProperty('classificationIds')) &&
      query.dataIds
    ) {
      mode = 'preview';
      return mode;
    }

    // 数据流
    if (!query.taskId) {
      bsState.isTaskFlow = false;
      mode = 'execute';
      if (query.type === 'readOnly') {
        mode = 'view';
      }
    } else {
      // task 流
      bsState.isTaskFlow = true;
      let stageType = query.stageType || '';
      stageType = stageType.toLowerCase();
      mode = getStageType(stageType);
    }

    // mode = 'taskAnnotate';
    return mode;
  }

  const blocking = computed(() => {
    return (
      bsState.doing.saving ||
      bsState.doing.rejecting ||
      bsState.doing.submitting ||
      bsState.doing.suspending ||
      bsState.doing.accepting ||
      state.editorMuted ||
      state.status !== StatusType.Default
    );
  });

  watch(
    () => blocking.value,
    () => {
      bsState.blocking = blocking.value;
    },
    {
      immediate: true,
    },
  );

  return {
    init,
  };
}

function getStageType(type: string): IHandlerType | undefined {
  let mode = undefined as IHandlerType | undefined;
  switch (type) {
    // url
    case 'annotate':
      mode = 'taskAnnotate';
      break;
    case 'review':
      mode = 'taskReview';
      break;
    case 'view':
      mode = 'taskView';
      break;
    case 'acceptance':
      mode = 'taskAccept';
      break;
    case 'quality':
      mode = 'taskQuality';
      break;
  }
  return mode;
}
