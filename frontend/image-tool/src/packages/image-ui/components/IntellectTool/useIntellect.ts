/* @ts-ignore */
import npyjs from 'npyjs';
import { reactive } from 'vue';
import { debounce, throttle } from 'lodash';
import { useInjectEditor } from '../../context';
import { Event as EditorEvent, ModelTypeEnum, ToolName, Vector2 } from '../../../image-editor';
import IntellectTool from './IntellectTool';
import { InferenceSession, Tensor, env } from 'onnxruntime-web';
import utils from './utils';
import { t } from '@/lang';

const BASE_PATH = '/tool/image';
const MODEL_DIR = '/model/basicai_sam.onnx';
const WASM_PATH = '/model/';
enum Action {
  HOVER = 'mouse_hover',
  CLICK = 'mouse_click',
}

export default function useIntellect() {
  const editor = useInjectEditor();
  let tool = {} as IntellectTool;
  let onnxModel: InferenceSession;
  let ortTensor: Tensor;
  const iState = reactive({
    src: '',
    // clicks: [] as IModelInputProps[],
    scale: { width: 0, height: 0, samScale: 1 },
    running: false,
    frameId: '',
  });
  editor.on(EditorEvent.INIT, () => {
    init();
  });
  editor.on(EditorEvent.MODEL_LOAD_SAM, async () => {
    await loadSAM();
  });
  editor.on(EditorEvent.FRAME_CHANGE, () => {
    tool.modeLoaded = false;
    if (editor.state.activeTool === ToolName.intellect) {
      editor.actionManager.execute('selectTool');
    }
  });

  function init() {
    tool = new IntellectTool(editor.mainView);
    editor.mainView.setShapeTool(tool.name, tool);

    tool.on(tool.EVENT_MOUSEMOVING, onMousemoving);
    tool.on(tool.EVENT_CLICK, onClick);
    tool.on(tool.EVENT_DRAW, loadSAM);

    initModel();
  }

  const throttleTm = 100;
  const onMousemoving = debounce((pos: Vector2) => {
    tool.clicks = [getClick(pos)];
    runONNX(Action.HOVER);
  }, throttleTm);
  const onClick = throttle((pos: Vector2, type: number) => {
    if (!tool.hasCreateMask) tool.clicks = [];
    tool.clicks.push(getClick(pos, type));
    runONNX(Action.CLICK);
  }, throttleTm);
  function getClick(pos: Vector2, clickType: number = 1) {
    return { ...pos, clickType };
  }

  async function initModel() {
    const host = location.hostname || location.host;
    const isLocalhost = host.indexOf('localhost') >= 0;
    let modelUrl = MODEL_DIR;
    if (isLocalhost) {
      env.wasm.wasmPaths = WASM_PATH;
      // env.wasm.wasmPaths = {
      //   'ort-wasm.wasm': 'ort-wasm.wasm',
      //   'ort-wasm-threaded.wasm': 'ort-wasm-threaded.wasm',
      //   'ort-wasm-simd.wasm': 'ort-wasm-simd.wasm',
      //   'ort-wasm-simd-threaded.wasm': 'ort-wasm-simd-threaded-simd.wasm',
      // };
    } else {
      env.wasm.wasmPaths = BASE_PATH + WASM_PATH;
      modelUrl = BASE_PATH + MODEL_DIR;
    }
    env.wasm.numThreads = 4;
    onnxModel = await InferenceSession.create(modelUrl); // default wasm
  }
  // 处理npy文件
  async function loadSAM() {
    // 已获取到npy文件并且已经加载进模型中, 则无需处理了
    if (tool.modeLoaded) return;

    const frame = editor.getCurrentFrame();
    // 已经获取过当前帧的 npy 文件, 则无需重复获取
    const samData = editor.modelManager.getModelResult(
      ModelTypeEnum.SEMANTIC_SEGMENTATION,
      frame,
      true,
    );
    if (!samData) {
      editor.modelManager.runSAM();
      return;
    }

    // 模型处理的 npy 文件就是当前帧的
    if (iState.frameId === frame.id) {
      tool.modeLoaded = true;
      return;
    }
    // 处理当前帧的 npy 文件, 模型已处理的npy文件不是当前帧时, showloading
    editor.showLoading({ type: 'loading', content: t('image.modelIsRunning') });
    try {
      iState.scale = utils.handleImageScale(frame.imageData?.image);
      const { segmentFileUrl } = samData;
      if (!segmentFileUrl) throw `SAM model's result file is undefined`;
      ortTensor = await loadNpyTensor(segmentFileUrl, 'float32');
      iState.frameId = frame.id;
      tool.modeLoaded = true;
    } catch (error) {
      console.error('model error', error);
      iState.frameId = '';
      tool.modeLoaded = false;
    }
    editor.showLoading(false);
  }
  // Decode a Numpy file into a tensor.
  async function loadNpyTensor(tensorFile: string, dType: any) {
    const npLoader = new npyjs();
    const npArray = await npLoader.load(tensorFile);
    const tensor = new Tensor(dType, npArray.data, npArray.shape);
    return tensor;
  }
  async function runONNX(action: Action) {
    try {
      if (!onnxModel || !tool.clicks || !ortTensor || !iState.scale || iState.running) return;
      const feeds = utils.modelData({
        clicks: tool.clicks,
        tensor: ortTensor,
        modelScale: iState.scale,
      });
      if (feeds === undefined) return;
      iState.running = true;
      // Run the SAM ONNX model with the feeds returned from modelData()
      let startTm = new Date().getTime();
      const results = await onnxModel.run(feeds);
      let endTm = new Date().getTime();
      console.log(`=====>onnx模型运行时间${endTm - startTm}ms`);
      startTm = endTm;
      const output = results[onnxModel.outputNames[0]];
      if (action === Action.CLICK) {
        const imgData = utils.arrayToImageData(
          output.data,
          output.dims[2],
          output.dims[3],
          tool.oriImageData,
        );
        tool.setMaskImageData(imgData);
        const showData = utils.arrayToMaskImageData(
          output.data,
          output.dims[2],
          output.dims[3],
          tool.oriImageData,
        );
        const canvas = utils.imageDataToCanvas(showData);
        tool.drawMask(canvas, 0.5);
      } else {
        // 生成image预览
        onnxMaskToImage(output.data, output.dims[2], output.dims[3]);
      }
      endTm = new Date().getTime();
      iState.running = false;
    } catch (e) {
      console.log(e);
    }
  }

  function onnxMaskToImage(input: any, width: number, height: number) {
    const canvas = utils.imageDataToCanvas(utils.arrayToImageData(input, width, height));
    // iState.src = canvas.toDataURL();
    tool.drawMask(canvas);
  }

  return {
    editor,
    iState,
    tool,
  };
}
