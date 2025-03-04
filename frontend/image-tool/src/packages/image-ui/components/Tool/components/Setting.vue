<template>
  <div class="setting">
    <div class="title1 border-bottom">{{ t('image.Setting') }}</div>
    <div class="wrap">
      <!-- Image -->
      <div class="title2">
        <span style="vertical-align: middle; margin-right: 10px">
          {{ t('image.Image') }}
        </span>
      </div>
      <div class="wrap">
        <a-row class="setting-item">
          <a-col :span="18" class="title">
            <span class="item-title">{{ t('image.imageSmoothing') }}</span>
          </a-col>
          <a-col :span="6">
            <a-switch
              v-model:checked="config.imageSmoothing"
              checked-children="On"
              un-checked-children="Off"
            />
          </a-col>
        </a-row>
        <a-row class="setting-item">
          <a-col :span="9" class="title">
            <span class="item-title">{{ t('image.Brightness') }}</span>
          </a-col>
          <a-col :span="15" class="item-value">
            <a-slider v-model:value="config.brightness" :min="-100" :max="100" :step="1" />
            <span>{{ config.brightness }}</span>
          </a-col>
        </a-row>
        <a-row class="setting-item">
          <a-col :span="9" class="title">
            <span class="item-title">{{ t('image.Contrast') }}</span>
          </a-col>
          <a-col :span="15" class="item-value">
            <a-slider v-model:value="config.contrast" :min="-100" :max="100" :step="1" />
            <span>{{ config.contrast }}</span>
          </a-col>
        </a-row>
        <a-row class="setting-item">
          <a-col :span="9" class="title">
            <span class="item-title">{{ t('image.pixelPrecision') }}</span>
          </a-col>
          <a-col :span="15" class="item-value">
            <a-slider v-model:value="config.pixelPrecision" :min="0" :max="4" :step="1" />
            <span>{{ config.pixelPrecision }}</span>
          </a-col>
        </a-row>
      </div>
      <div class="divider"></div>
      <!-- Result -->
      <div class="title2">
        <span style="vertical-align: middle; margin-right: 10px">{{ t('image.Result') }}</span>
      </div>
      <div class="wrap">
        <a-row class="setting-item">
          <a-col :span="9" class="title">
            <span class="item-title">{{ t('image.Opacity') }}</span>
          </a-col>
          <a-col :span="15" class="item-value">
            <a-slider v-model:value="config.baseFillOpacity" :min="0" :max="1" :step="0.01" />
            <span> {{ config.baseFillOpacity }}</span>
          </a-col>
        </a-row>
        <a-row class="setting-item">
          <a-col :span="9" class="title">
            <span class="item-title">{{ t('image.Border Width') }}</span>
          </a-col>
          <a-col :span="15" class="item-value">
            <a-slider v-model:value="config.strokeWidth" :min="1" :max="5" :step="1" />
            <span> {{ config.strokeWidth }}px</span>
          </a-col>
        </a-row>
        <a-row class="setting-item">
          <label style="margin-right: 10px">{{ t('image.Default Result Color') }}</label>
          <a-tooltip trigger="click">
            <template #title>
              <ColorPicker
                v-model:pure-color="config.defaultResultColor"
                format="hex8"
                picker-type="chrome"
                :isWidget="true"
                disableHistory
              />
            </template>
            <div
              class="color-picker-item"
              :style="{ backgroundColor: config.defaultResultColor }"
            ></div>
          </a-tooltip>
          <label style="margin-left: 6px">{{ config.defaultResultColor }}</label>
        </a-row>

        <a-row class="setting-item">
          <a-col :span="18" class="title">
            <span class="item-title">{{ t('image.Show Size') }}</span>
            <IconKeyboard class="item-hotkey" />
            <span>B</span>
          </a-col>
          <a-col :span="6">
            <a-switch
              v-model:checked="config.showSizeTips"
              checked-children="On"
              un-checked-children="Off"
            />
          </a-col>
        </a-row>
        <a-row class="setting-item">
          <a-col :span="18" class="title">
            <span class="item-title">{{ t('image.Show Class') }}</span>
            <IconKeyboard class="item-hotkey" />
            <span>M</span>
          </a-col>
          <a-col :span="6">
            <a-switch
              v-model:checked="config.showClassTitle"
              checked-children="On"
              un-checked-children="Off"
            />
          </a-col>
        </a-row>
        <a-row class="setting-item">
          <a-col :span="18" class="title">
            <span class="item-title">{{ t('image.Show Single Result') }}</span>
            <IconKeyboard class="item-hotkey" />
            <span>S</span>
          </a-col>
          <a-col :span="6">
            <a-switch
              v-model:checked="config.showSingleResult"
              checked-children="On"
              un-checked-children="Off"
            />
          </a-col>
        </a-row>
        <!-- 是否根据选中结果显示mask -->
        <a-row class="setting-item" v-show="config.showSingleResult">
          <a-col :span="18" class="title">
            <span class="item-title">{{ t('image.Crop by selected area') }}</span>
          </a-col>
          <a-col :span="6">
            <a-switch
              v-model:checked="config.selectedViewType.showMask"
              checked-children="On"
              un-checked-children="Off"
            />
          </a-col>
        </a-row>
        <a-row
          class="setting-item"
          v-show="config.showSingleResult && config.selectedViewType.showMask"
        >
          <a-col :span="3" class="title">
            <!-- <ColorPicker
              v-model:pure-color="config.selectedViewType.maskColor"
              format="hex8"
              picker-type="chrome"
              disableHistory
              style="width: 24px"
            /> -->
            <a-tooltip trigger="click">
              <template #title>
                <ColorPicker
                  v-model:pure-color="config.selectedViewType.maskColor"
                  format="hex8"
                  picker-type="chrome"
                  :isWidget="true"
                  disableHistory
                />
              </template>
              <div
                class="color-picker-item"
                :style="{ backgroundColor: config.selectedViewType.maskColor }"
              ></div>
            </a-tooltip>
          </a-col>
          <a-col :span="21" class="title">
            {{ config.selectedViewType.maskColor }}
          </a-col>
        </a-row>
        <!-- 显示组结果样式 -->
        <a-row class="setting-item">
          <a-col :span="18" class="title">
            <span class="item-title">{{ t('image.Show Group Result') }}</span>
            <IconKeyboard class="item-hotkey" />
            <span>/</span>
          </a-col>
          <a-col :span="6">
            <a-switch
              v-model:checked="config.showGroupBox"
              checked-children="On"
              un-checked-children="Off"
            />
          </a-col>
        </a-row>
        <!-- 结果序号 -->
        <a-row class="setting-item">
          <a-col :span="18" class="title">
            <span class="item-title">{{ t('image.Show Result Number') }}</span>
            <IconKeyboard class="item-hotkey" />
            <span>J</span>
          </a-col>
          <a-col :span="6">
            <a-switch
              v-model:checked="config.showResultNumber"
              checked-children="On"
              un-checked-children="Off"
            />
          </a-col>
        </a-row>
        <div class="title2">
          <span>{{ t('image.Default Property Value') }}</span>
          <a-radio-group v-model:value="config.propValue" style="width: 254px">
            <a-radio :value="PropValueOrigin.default">
              {{ t('image.Default ontology value') }}
            </a-radio>
            <a-radio :value="PropValueOrigin.inherit">
              {{ t('image.Selected instance value') }}
            </a-radio>
          </a-radio-group>
        </div>
      </div>
      <div class="divider"></div>
      <!-- Comment -->
      <div class="title2">
        <span style="vertical-align: middle; margin-right: 10px">{{ t('image.Comment') }}</span>
      </div>
      <div class="wrap">
        <a-row class="setting-item">
          <a-col :span="18" class="title">
            <span class="item-title">{{ t('image.Show Comments') }}</span>
            <IconKeyboard class="item-hotkey" />
            <span>N</span>
          </a-col>
          <a-col :span="6">
            <a-switch
              v-model:checked="config.showComment"
              checked-children="On"
              un-checked-children="Off"
            />
          </a-col>
        </a-row>
      </div>
      <div class="divider"></div>
      <!--  Other-->
      <div class="title2">
        <span style="vertical-align: middle; margin-right: 10px">{{ t('image.Other') }}</span>
        <!-- <div class="divider"></div> -->
      </div>
      <div class="wrap">
        <a-row class="setting-item">
          <a-col :span="18" class="title">
            <span class="item-title">{{ t('image.Auxiliary Line') }}</span>
            <IconKeyboard class="item-hotkey" />
            <span>Y</span>
          </a-col>
          <a-col :span="6">
            <a-switch
              v-model:checked="config.helperLine.showLine"
              checked-children="On"
              un-checked-children="Off"
            />
          </a-col>
        </a-row>
        <a-row class="setting-item" v-show="config.helperLine.showLine">
          <a-col :span="3">
            <a-tooltip trigger="click">
              <template #title>
                <ColorPicker
                  v-model:pure-color="config.helperLine.lineColor"
                  format="hex8"
                  picker-type="chrome"
                  :isWidget="true"
                  disableHistory
                />
              </template>
              <div
                class="color-picker-item"
                :style="{ backgroundColor: config.helperLine.lineColor }"
              ></div>
            </a-tooltip>
          </a-col>
          <a-col :span="21">
            {{ config.helperLine.lineColor }}
          </a-col>
        </a-row>
        <a-row class="setting-item">
          <a-col :span="18" class="title">
            <span class="item-title">{{ t('image.Auxiliary Shape') }}</span>
            <IconKeyboard class="item-hotkey" />
            <span>U</span>
          </a-col>
          <a-col :span="6">
            <a-switch
              v-model:checked="config.helperLine.showCircle"
              checked-children="On"
              un-checked-children="Off"
            />
          </a-col>
        </a-row>
        <div v-show="config.helperLine.showCircle" class="setting-item item-help">
          <a-row style="width: 100%">
            <a-col :span="3">
              <a-tooltip trigger="click">
                <template #title>
                  <ColorPicker
                    v-model:pure-color="config.helperLine.toolColor"
                    format="hex8"
                    picker-type="chrome"
                    :isWidget="true"
                    disableHistory
                  />
                </template>
                <div
                  class="color-picker-item"
                  :style="{ backgroundColor: config.helperLine.toolColor }"
                ></div>
              </a-tooltip>
            </a-col>
            <a-col :span="21">
              {{ config.helperLine.toolColor }}
            </a-col>
          </a-row>
          <a-radio-group v-model:value="helpIndex" style="width: 254px" @change="handleChange">
            <div class="help-radios" v-for="(item, index) in helpList" :key="index">
              <a-radio :value="index"></a-radio>
              <IconTooltypeCircle v-if="item.radius > 0" />
              <IconTooltypeBoundingBox v-else />
              <div style="flex: 1; width: 182px">
                <a-input v-model:value="item.name" placeholder="name"></a-input>
                <div class="item-inputs" v-if="item.radius === 0">
                  <span>{{ t('image.Width') }}</span>
                  <a-input-number
                    class="input-width"
                    v-model:value="item.width"
                    :formatter="(value: number) => value || 0"
                    :min="0"
                    :max="4000"
                    :precision="1"
                    @change="handleHelpInput"
                  />
                  <span>{{ t('image.Height') }}</span>
                  <a-input-number
                    class="input-width"
                    v-model:value="item.height"
                    :formatter="(value: number) => value || 0"
                    :min="0"
                    :max="4000"
                    :precision="1"
                    @change="handleHelpInput"
                  />
                  <span>({{ t('image.px') }})</span>
                </div>
                <div class="item-inputs" v-else>
                  <span>{{ t('image.radius') }}</span>
                  <a-input-number
                    class="input-radius"
                    v-model:value="item.width"
                    :formatter="(value: number) => value || 0"
                    :min="0"
                    :max="2000"
                    :precision="1"
                    @change="handleHelpInput"
                  />
                  <span>({{ t('image.px') }})</span>
                </div>
              </div>
              <div class="item-delete" @click="onDelete(index)">
                <IconDelete />
              </div>
            </div>
          </a-radio-group>
          <div class="help-add">
            <label @click="addHelpTool(1)">+{{ t('image.Add a circle') }}</label>
            <label @click="addHelpTool(0)">+{{ t('image.Add a rectangle') }}</label>
          </div>
        </div>
        <!-- 等分线 -->
        <a-row class="setting-item">
          <a-col :span="18" class="title">
            <span class="item-title">{{ t('image.BisectrixLine') }}</span>
            <IconKeyboard class="item-hotkey" />
            <span>I</span>
          </a-col>
          <a-col :span="6">
            <a-switch
              v-model:checked="config.bisectrixLine.enable"
              checked-children="On"
              un-checked-children="Off"
            />
          </a-col>
        </a-row>
        <a-row class="setting-item" v-show="config.bisectrixLine.enable">
          <a-col :span="12">
            <span style="margin-right: 4px">{{ t('image.horizontal') }}</span>
            <a-input-number
              :disabled="!config.bisectrixLine.enable"
              v-model:value="config.bisectrixLine.horizontal"
              size="small"
              :min="2"
              :step="1"
              :max="10"
              style="width: 50px"
            />
          </a-col>
          <a-col :span="12">
            <span style="margin-right: 4px">{{ t('image.vertical') }}</span>
            <a-input-number
              :disabled="!config.bisectrixLine.enable"
              v-model:value="config.bisectrixLine.vertical"
              size="small"
              :min="2"
              :step="1"
              :max="10"
              style="width: 50px"
            />
          </a-col>
          <a-col :span="12">
            <span style="margin-right: 4px">{{ t('image.Width') }}</span>
            <a-input-number
              v-model:value="config.bisectrixLine.width"
              size="small"
              :min="1"
              :step="1"
              :max="100"
              style="width: 50px"
            />
            <span>{{ t('image.px') }}</span>
          </a-col>
          <a-col :span="3">
            <a-tooltip trigger="click">
              <template #title>
                <ColorPicker
                  v-model:pure-color="config.bisectrixLine.color"
                  format="hex8"
                  picker-type="chrome"
                  :isWidget="true"
                  disableHistory
                />
              </template>
              <div
                class="color-picker-item"
                :style="{ backgroundColor: config.bisectrixLine.color }"
              ></div>
            </a-tooltip>
          </a-col>
          <a-col :span="9">
            {{ config.bisectrixLine.color }}
          </a-col>
        </a-row>
        <!-- display mode -->
        <a-row class="setting-item">
          <a-col :span="12" class="title">
            <span class="item-title">{{ t('image.Display Mode') }}</span>
            <IconKeyboard class="item-hotkey" />
            <span>.</span>
          </a-col>
          <a-col :span="12">
            <a-radio-group v-model:value="config.viewType" size="small">
              <a-radio-button :value="DisplayModeEnum.MARK">Mark</a-radio-button>
              <a-radio-button :value="DisplayModeEnum.MASK">Mask</a-radio-button>
            </a-radio-group>
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import { throttle } from 'lodash';
  import { ColorPicker } from 'vue3-colorpicker';
  import 'vue3-colorpicker/style.css';
  import { IconDelete, IconTooltypeCircle, IconTooltypeBoundingBox } from '@basicai/icons';
  import { useInjectEditor } from '../../../context';
  import {
    DisplayModeEnum,
    IHelpLineConfig,
    Event,
    PropValueOrigin,
    Background,
    utils,
  } from '../../../../image-editor';
  import { t } from '@/lang';

  const editor = useInjectEditor();
  const config = editor.state.config;
  const helpIndex = ref(0);
  const helpList = ref<IHelpLineConfig[]>([]);
  const settingStorage = utils.storageSetting();

  function resetHelpConfig(index: number = 0) {
    helpIndex.value = index;
    updateHelpLine();
  }
  function onDelete(index: number) {
    helpList.value.splice(index, 1);
    if (helpIndex.value >= helpList.value.length) resetHelpConfig();
    else if (index === helpIndex.value) updateHelpLine();
  }
  function addHelpTool(r: number) {
    const helpTool: IHelpLineConfig = { name: '', radius: r, width: 100, height: 100 };
    helpList.value.push(helpTool);
    if (helpList.value.length === 1) resetHelpConfig();
  }
  function handleChange() {
    updateHelpLine();
  }
  function handleHelpInput() {
    updateHelpLine();
  }
  function updateHelpLine() {
    const helpCfg = helpList.value[helpIndex.value];
    const { width, height, radius } = helpCfg || { width: 0, height: 0, radius: 0 };
    const w = width * (1 + radius);
    config.helperLine.radius = radius;
    config.helperLine.width = w;
    config.helperLine.height = radius > 0 ? w : height;
  }
  function updateHelpList() {
    helpList.value = [...config.helpLineConfig, ...helpList.value];
  }

  const update = throttle((type: string) => {
    switch (type) {
      case 'canvasStyle': {
        Background.getInstance().updateBackgroundStyle();
        break;
      }
      case 'imageSmoothing': {
        editor.mainView.imageSmoothing(config.imageSmoothing);
        break;
      }
      case 'shapeStyle': {
        config.baseLineWidth = config.strokeWidth - 1;
        editor.mainView.draw();
        break;
      }
      case 'showSource': {
        // TODO
        // editor.toggleLabel(config.showSource);
        break;
      }
      case 'showSingleResult': {
        editor.updateObjectVisible();
        editor.emit(Event.SELECT_RESULT_MASK);
        break;
      }
      case 'selectedViewType': {
        editor.emit(Event.SELECT_RESULT_MASK);
        break;
      }
      case 'viewType': {
        editor.mainView.updateBGDisplayModel();
        break;
      }
      case 'bisectrixLine': {
        Background.getInstance().updateEquisector();
        break;
      }
      case 'showGroupBox': {
        editor.mainView.stage.setAttrs({ showGroupBox: config.showGroupBox });
        break;
      }
    }
    // console.log('update config', type, options);
  }, 200);

  watch(
    () => [config.brightness, config.contrast],
    () => {
      update('canvasStyle');
    },
  );
  watch(
    () => config.imageSmoothing,
    () => {
      update('imageSmoothing');
    },
  );
  watch(
    () => [config.baseFillOpacity, config.strokeWidth],
    () => {
      update('shapeStyle');
    },
  );
  watch(
    () => [config.showGroupBox],
    () => {
      update('showGroupBox');
    },
  );
  watch(
    () => [config.showSingleResult],
    () => {
      update('showSingleResult');
    },
  );
  watch(
    () => [config.selectedViewType],
    () => {
      update('selectedViewType');
    },
    { deep: true },
  );
  watch(
    () => [config.viewType],
    () => {
      update('viewType');
    },
  );
  watch(
    () => [config.bisectrixLine],
    () => {
      update('bisectrixLine');
    },
    { deep: true },
  );
  watch(
    () => config.helpLineConfig,
    () => {
      updateHelpList();
    },
    { immediate: true },
  );
  watch(
    () => [config.helperLine.lineColor, config.helperLine.toolColor],
    () => {
      settingStorage.set({
        helpLineColor: config.helperLine.lineColor,
        helpToolColor: config.helperLine.toolColor,
      });
    },
  );
  watch(
    () => config.defaultResultColor,
    () => {
      editor.mainView.currentDrawTool?.assignConfig({ stroke: config.defaultResultColor });
      editor.mainView.draw();
      settingStorage.set({ drawColor: config.defaultResultColor });
    },
  );
  onMounted(() => {
    updateHelpLine();
  });
</script>

<style lang="less">
  .setting {
    color: #bec1ca;

    .divider {
      margin: 20px 0;
      border-bottom: 1px solid rgb(122 122 122);
    }

    .setting-item {
      display: flex;
      margin-bottom: 10px;
      justify-content: flex-start;
      align-items: center;

      .ant-slider {
        //   width: 100px;
        margin: 6px;
        flex: 75% 0 1;
      }

      .item-value {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .help-radios {
        display: flex;
        margin-bottom: 10px;
        justify-content: space-around;
        align-items: center;
        font-size: 12px;
        gap: 8px;
        line-height: 30px;

        .icon {
          font-size: 16px;
        }

        .item-inputs {
          display: flex;
          gap: 6px;
        }

        .input-width {
          max-width: 50px;
        }

        .item-delete {
          font-size: 16px;
          color: rgb(249 112 102);
          cursor: pointer;
        }
      }

      .help-add {
        display: flex;
        padding: 0 40px 0 20px;
        justify-content: space-between;
        width: 100%;
        flex-direction: row;

        label {
          color: @primary-color;
          cursor: pointer;

          &:hover {
            color: @primary-color;
          }
        }
      }

      .color-picker-item {
        border: 1px solid #000000;
        width: 20px;
        height: 20px;
        cursor: pointer;
      }
    }

    .item-help {
      flex-direction: column;
      gap: 2px;

      .ant-input-number {
        height: 24px;
      }

      .ant-input,
      .ant-input-number-input {
        padding: 0 6px;
        border: 1px solid #717171;
        height: 24px;
        font-size: 12px;
      }
    }

    .ant-radio-wrapper {
      display: block;
      margin: 0;
      font-size: 12px;

      .ant-radio-inner {
        width: 12px;
        height: 12px;
      }
    }

    .reset {
      border: 1px solid #6d7278;
      float: right;
      font-size: 12px;
      color: #6d7278;
    }

    .item-title {
      white-space: nowrap;
    }

    .item-hotkey {
      margin: 3px 5px 0;
      font-size: 12px;
    }
  }
</style>
