<template>
  <div class="setting">
    <div class="title1 border-bottom">{{ lang('Setting') }}</div>
    <div class="wrap">
      <!-- Image -->
      <div class="title2">
        <span style="vertical-align: middle; margin-right: 10px">
          {{ lang('Image') }}
        </span>
      </div>
      <div class="wrap">
        <a-row class="setting-item">
          <a-col :span="18" class="title">
            <span class="item-title">{{ lang('imageSmoothing') }}</span>
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
            <span class="item-title">{{ lang('Brightness') }}</span>
          </a-col>
          <a-col :span="15" class="item-value">
            <a-slider v-model:value="config.brightness" :min="-100" :max="100" :step="1" />
            <span>{{ config.brightness }}</span>
          </a-col>
        </a-row>
        <a-row class="setting-item">
          <a-col :span="9" class="title">
            <span class="item-title">{{ lang('Contrast') }}</span>
          </a-col>
          <a-col :span="15" class="item-value">
            <a-slider v-model:value="config.contrast" :min="-100" :max="100" :step="1" />
            <span>{{ config.contrast }}</span>
          </a-col>
        </a-row>
      </div>
      <div class="divider"></div>
      <!-- Result -->
      <div class="title2">
        <span style="vertical-align: middle; margin-right: 10px">{{ lang('Result') }}</span>
      </div>
      <div class="wrap">
        <a-row class="setting-item">
          <a-col :span="9" class="title">
            <span class="item-title">{{ lang('Opacity') }}</span>
          </a-col>
          <a-col :span="15" class="item-value">
            <a-slider v-model:value="config.baseFillOpacity" :min="0" :max="1" :step="0.01" />
            <span> {{ config.baseFillOpacity }}</span>
          </a-col>
        </a-row>
        <a-row class="setting-item">
          <a-col :span="9" class="title">
            <span class="item-title">{{ lang('Border Width') }}</span>
          </a-col>
          <a-col :span="15" class="item-value">
            <a-slider v-model:value="config.strokeWidth" :min="1" :max="5" :step="1" />
            <span> {{ config.strokeWidth }}px</span>
          </a-col>
        </a-row>

        <a-row class="setting-item">
          <a-col :span="18" class="title">
            <span class="item-title">{{ lang('Show Size') }}</span>
            <i class="iconfont icon-hotkey item-hotkey"></i>
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
            <span class="item-title">{{ lang('Show Class') }}</span>
            <i class="iconfont icon-hotkey item-hotkey"></i>
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
      </div>
      <div class="divider"></div>
      <!--  Other-->
      <div class="title2">
        <span style="vertical-align: middle; margin-right: 10px">{{ lang('Other') }}</span>
      </div>
      <div class="wrap">
        <a-row class="setting-item">
          <a-col :span="18" class="title">
            <span class="item-title">{{ lang('Auxiliary Line') }}</span>
            <i class="item-hotkey iconfont icon-hotkey"></i>
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
            <span class="item-title">{{ lang('BisectrixLine') }}</span>
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
            <span style="margin-right: 4px">{{ lang('horizontal') }}</span>
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
            <span style="margin-right: 4px">{{ lang('vertical') }}</span>
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
            <span style="margin-right: 4px">{{ lang('Width') }}</span>
            <a-input-number
              v-model:value="config.bisectrixLine.width"
              size="small"
              :min="1"
              :step="1"
              :max="100"
              style="width: 50px"
            />
            <span>{{ lang('px') }}</span>
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
            <span class="item-title">{{ lang('Display Mode') }}</span>
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
  import { watch } from 'vue';
  import { throttle } from 'lodash';
  import { ColorPicker } from 'vue3-colorpicker';
  import 'vue3-colorpicker/style.css';
  import { useInjectEditor } from '../../../context';
  import { DisplayModeEnum } from '../../../../image-editor';
  import { BackgroundGroup } from 'image-editor/ImageView';

  const editor = useInjectEditor();
  const config = editor.state.config;
  const lang = editor.lang;

  const update = throttle((type: string) => {
    switch (type) {
      case 'canvasStyle': {
        BackgroundGroup.getInstance().updateBackgroundStyle();
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
      case 'viewType': {
        editor.mainView.updateBGDisplayModel();
        break;
      }
      case 'bisectrixLine': {
        BackgroundGroup.getInstance().updateEquisector();
        break;
      }
    }
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
</script>

<style lang="less">
  .setting {
    .divider {
      margin: 20px 0;
      border-bottom: 1px solid rgb(122 122 122);
    }

    .setting-item {
      display: flex;
      margin-bottom: 10px;
      justify-content: space-between;
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
          color: #57ccef;
          cursor: pointer;

          &:hover {
            color: #177ddc;
          }
        }
      }

      .vc-color-wrap {
        width: 20px;
        height: 20px;
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

      .ant-radio-wrapper {
        margin: 0;
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
