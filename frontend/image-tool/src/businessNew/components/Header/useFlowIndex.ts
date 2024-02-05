import { computed } from 'vue';
import { useInjectBSEditor } from '../../context';
import Event from '../../configs/event';

export default function useFlowIndex() {
  const editor = useInjectBSEditor();
  const { state } = editor;

  const indexInfo = computed(() => {
    let total = 1;
    let currentIndex = 1;
    if (state.isSeriesFrame) {
      total = state.sceneIds.length;
      currentIndex = state.sceneIndex;
    } else {
      total = state.frames.length;
      currentIndex = state.frameIndex;
    }
    return {
      total,
      currentIndex,
    };
  });

  async function onIndex(args: { index: number }) {
    const { index } = args;
    const { frames } = editor.state;
    if (state.isSeriesFrame) {
      const { sceneIds, sceneIndex } = state;
      if (index < 0 || index >= sceneIds.length) return;
      const needSave = frames.findIndex((e) => e.needSave) !== -1;
      if (needSave) {
        const result = await editor.save();
        if (!result) return;
      }
      await editor.loadManager.loadSceneData(index);
      editor.emit(Event.SCENE_CHANGE, { preScene: sceneIndex, newScene: index });
    } else {
      if (index < 0 || index >= frames.length) return;
      editor.switchFrame(index);
    }
  }
  return {
    indexInfo,
    onIndex,
  };
}
