import { reactive } from 'vue';
import { useInjectBSEditor } from '../../context';
import { divide, round } from 'lodash';

interface IDetails {
  label: string;
  value: any;
}
export default function useDataInfo() {
  const dataInfo = reactive({ name: '', sceneName: '', details: [] as IDetails[] });
  const editor = useInjectBSEditor();
  const updateDataInfo = async () => {
    let name: string = '';
    const details: IDetails[] = [];
    const frame = editor.getCurrentFrame();
    if (frame) {
      const dataName = frame.imageData?.name || '';
      if (!name) name = dataName;
      details.push({
        label: editor.lang('titleFrame'),
        value: [
          { label: editor.lang('Data ID'), value: frame.id },
          { label: editor.lang('Data Name'), value: dataName },
          {
            label: editor.lang('Data Size'),
            value: round(divide(frame.imageData?.size || 0, 1024 * 1024), 2) + 'MB',
          },
          {
            label: editor.lang('Width x height'),
            value: `${editor.mainView.backgroundWidth} x ${editor.mainView.backgroundHeight}`,
          },
        ],
      });
    }
    dataInfo.name = name || '...';
    dataInfo.sceneName = frame.imageData?.name || '';
    dataInfo.details = details;
  };
  return {
    dataInfo,
    updateDataInfo,
  };
}
