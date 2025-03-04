import { computed } from 'vue';
import { useInjectBSEditor } from '../../context';
import Event from '../../config/event';

export default function useFlowIndex() {
  const editor = useInjectBSEditor();
  const { state, bsState } = editor;

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

  async function onIndex(args: { index: number; method: string }) {
    const { index, method } = args;
    const { frames } = editor.state;
    if (state.isSeriesFrame) {
      // 连续帧切换scene
      const { sceneIds, sceneIndex } = state;
      if (index < 0 || index >= sceneIds.length) return;
      const needSave = frames.findIndex((e) => e.needSave) !== -1 && !bsState.isVisitorClaim;
      if (needSave) {
        const result = await editor.save();
        if (!result) return;
      }
      await editor.loadManager.loadSceneData(index);
      editor.emit(Event.SCENE_CHANGE, { preScene: sceneIndex, newScene: index });
    } else {
      // 非连续帧切换data
      if (index < 0 || index >= frames.length) return;
      editor.switchFrame(index, { Method: method });
    }
  }
  return {
    indexInfo,
    onIndex,
  };
}
