import { reactive } from 'vue';
import { useInjectBSEditor } from '../../context';
import { divide, round } from 'lodash';
import { getDataInfo } from '../../api';
import { t } from '@/lang';

interface IDetails {
  label: string;
  value: any;
}
export default function useDataInfo() {
  const dataInfo = reactive({ name: '', sceneName: '', details: [] as IDetails[] });
  const editor = useInjectBSEditor();
  const { bsState, state } = editor;
  const updateDataInfo = async () => {
    let name: string = '';
    const details: IDetails[] = [];
    const frame = editor.getCurrentFrame();
    if (bsState.isTaskFlow) {
      name = bsState.task.name;
      details.push({
        label: t('image.titleTask'),
        value: [
          {
            label: t('image.TaskID'),
            value: bsState.task.id,
          },
          {
            label: t('image.TaskName'),
            value: bsState.task.name,
          },
        ],
      });
    }
    if (state.isSeriesFrame) {
      const sceneId = state.sceneId;
      const info = bsState.sceneInfoCache[sceneId];
      if (!info && !bsState.isTaskFlow) {
        await getDataInfo(sceneId).then((data) => {
          bsState.sceneInfoCache[sceneId] = { name: data.name };
        });
      }
      details.push({
        label: t('image.titleScene'),
        value: [
          {
            label: t('image.titleSceneId'),
            value: sceneId,
          },
          {
            label: t('image.titleSceneName'),
            value: bsState.sceneInfoCache[sceneId]?.name,
          },
          { label: t('image.titleSceneIndex'), value: editor.state.frameIndex + 1 },
        ],
      });
    }
    if (frame) {
      const dataName = frame.imageData?.name || '';
      if (!name) name = dataName;
      details.push({
        label: t('image.titleFrame'),
        value: [
          { label: t('image.DataID'), value: frame.id },
          { label: t('image.DataName'), value: dataName },
          {
            label: t('image.DataSize'),
            value: round(divide(frame.imageData?.size || 0, 1024 * 1024), 2) + 'MB',
          },
          {
            label: t('image.WidthXheight'),
            value: `${editor.mainView.backgroundWidth} x ${editor.mainView.backgroundHeight}`,
          },
        ],
      });
    }
    dataInfo.name = name || '...';
    dataInfo.sceneName = bsState.sceneInfoCache[state.sceneId]?.name || frame.imageData?.name || '';
    dataInfo.details = details;
  };
  return {
    dataInfo,
    updateDataInfo,
  };
}
