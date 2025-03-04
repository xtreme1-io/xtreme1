import { useInjectBSEditor } from '../../context';
import ErrorlogManager from '../../common/ErrorlogManager';
import * as utils from '../../utils';
import { Background } from 'image-editor';

interface IIssueInfo {
  toolProject: '图片工具' | '点云工具' | '音频工具';
  // user
  userInfo: any;
  teamInfo: any;
  // task
  // data
  datasetId: string;
  dataIds: string[];
  dataId: string;
  resultData: any;
  // seriesFrame
  isSeriesFrame: boolean;
  // tool
  setting: any;
  toolMode: any;
  bgImg_frame?: string;
  bgImg_canvas?: string;
  curDrawTool?: any;
  curEditTool?: any;
  // system
  consoleError: any;
  currentUrl: string;
  browser: any;
  os: any;
}

export default function useIssue() {
  const editor = useInjectBSEditor();
  const { bsState, state, userAgent } = editor;

  function getBaseInfo(): Record<string, any> {
    // user info
    return {
      user_id: bsState.user.id,
      user_name: bsState.user.nickname,
      user_email: bsState.user.email,
      team_id: bsState.team.id,
      team_name: bsState.team.name,
    };
  }
  function getIssueInfoFile() {
    const frame = editor.getCurrentFrame();
    const info: IIssueInfo = {
      toolProject: '图片工具',
      userInfo: bsState.user,
      teamInfo: bsState.team,
      isSeriesFrame: state.isSeriesFrame,
      datasetId: bsState.datasetId,
      dataId: frame?.id,
      dataIds: state.frames.map((e) => e.id),
      resultData: bsState.isTaskFlow
        ? utils.getTaskSaveData(editor, [frame])
        : utils.getDataFlowSaveData(editor, [frame]),
      setting: state.config,
      toolMode: state.imageToolMode,
      bgImg_frame: frame?.imageData?.url,
      bgImg_canvas: Background.getInstance().getImageUrl(),
      curDrawTool: editor.mainView.currentDrawTool?.name,
      curEditTool: editor.mainView.currentEditTool?.name,
      consoleError: ErrorlogManager.getInstance().getErrors(true),
      currentUrl: window?.location?.href || '',
      browser: userAgent.browser,
      os: userAgent.os,
    };
    const name = `basicai_issue_${bsState.user.id}_${Date.now()}.json`;
    return getIssueJsonFile(name, JSON.stringify(info));
  }
  return {
    getIssueInfoFile,
    getBaseInfo,
  };
}

function getIssueJsonFile(name: string, data: any) {
  const blob = new Blob([data]);
  const file = new File([blob], name, { type: 'json', lastModified: Date.now() });
  // const link = document.createElement('a');
  // link.href = URL.createObjectURL(blob);
  // link.download = name;
  // link.click();
  return file;
}
