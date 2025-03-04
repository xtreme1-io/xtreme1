<template>
  <div class="class-copy">
    <span>{{ `${t('image.frame-title')}: ${editor.state.frameIndex + 1}` }}</span>
    <div class="copy-attr">
      <span>{{ t('image.Attribute') }}</span>
      <div class="copy-icon">
        <NodeCollapseOutlined
          :class="{ icon: true, active: state.copyType == 'from' }"
          @click="disabled ? void 0 : onChooseCopyType('from')"
          title="attr-copy-from"
        />
        <NodeExpandOutlined
          :class="{ icon: true, active: state.copyType == 'to' }"
          @click="disabled ? void 0 : onChooseCopyType('to')"
          title="attr-copy-to"
        />
      </div>
    </div>
    <div v-show="state.copyType" class="copy-info">
      <div v-if="state.copyType == 'from'">
        <div>{{ t('image.copy_attrs_from') }}</div>
        <div class="copy-select">
          <span style="margin-right: 10px">{{ t('image.Objects') }} </span>
          <a-select
            show-search
            animation="no"
            size="small"
            :options="state.objects"
            v-model:value="state.copyObject"
          >
          </a-select>
        </div>
      </div>
      <div v-else-if="state.copyType == 'to'">
        <div>{{ t('image.copy_attrs_from_frames') }}</div>
        <div class="warn-tips">{{ t('image.copy_attrs_from_frames_tips') }}</div>
        <div>
          {{ t('image.Copy To Frames') }}
          {{ state.range.length > 0 ? ` (${String(state.range)})` : '' }}
        </div>
        <a-slider range v-model:value="state.range" :min="1" :max="state.frames" />
      </div>
      <div class="copy-btn">
        <a-button style="margin-right: 10px" size="small" @click="onCancel">
          {{ t('image.cancel') }}
        </a-button>
        <a-button type="primary" size="small" @click="onCopy" :disabled="state.copyDisable">
          {{ t('image.Copy') }}
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, watch } from 'vue';
  import { NodeExpandOutlined, NodeCollapseOutlined } from '@ant-design/icons-vue';
  import { useInjectEditor } from '../../../context';
  import { useInject } from '../context';
  import { AnnotateObject } from '../../../../image-editor';
  import { cloneDeep } from 'lodash';
  import { t } from '@/lang';

  interface IObjectOption {
    value: string;
    label: string;
    object: AnnotateObject;
  }
  const editor = useInjectEditor();
  const editState = useInject();
  const state = reactive({
    copyType: '',
    // to
    range: [] as number[],
    frames: 0,
    // from
    objects: [] as IObjectOption[],
    copyObject: '',
    copyDisable: false,
  });
  const disabled = computed(() => {
    return editor.state.modeConfig.op === 'view';
  });
  watch(
    () => editor.state.config.showClassView,
    () => {
      if (!editor.state.config.showClassView) {
        state.copyType = '';
      }
    },
  );

  function onChooseCopyType(type: 'from' | 'to' | '') {
    if (state.copyType == type) state.copyType = '';
    else state.copyType = type;
    if (state.copyType == '') return;
    if (state.copyType == 'from') {
      state.copyObject = '';
      updateSameclassObjects();
    } else if (state.copyType == 'to') {
      updateFrameRangeInfo();
    }
  }
  // 初始连续帧范围信息
  function updateFrameRangeInfo() {
    const { frames } = editor.state;
    state.frames = frames.length;
    state.range = [1, state.frames];
  }
  // 更新当前帧所有相同class的objects
  function updateSameclassObjects() {
    const frame = editor.getCurrentFrame();
    const frameObjects = editor.dataManager.getFrameObject(frame.id);
    if (frameObjects) {
      const objs = frameObjects.filter(
        (obj) => editState.classId && obj.userData.classId == editState.classId,
      );
      state.objects = objs.map((e) => {
        return {
          object: e,
          value: e.uuid,
          label: `#${e.userData.trackName} (${e.userData.trackId})`,
        };
      });
    } else state.objects = [];
  }
  function onCancel() {
    onChooseCopyType('');
  }
  function onCopy() {
    if (!state.copyType) return;
    if (state.copyType == 'from') {
      copyFrom();
    } else if (state.copyType == 'to') {
      copyTo();
    }
    editor.showMsg('success', t('image.copy-ok'));
  }
  function copyFrom() {
    const copyObjectUUID = state.copyObject;
    if (!copyObjectUUID) return;
    const copyObject = state.objects.find((e) => copyObjectUUID == e.value)?.object;
    if (!copyObject) return;
    const copyUserData = cloneDeep(copyObject.userData);
    updateCopyAttrs(editState.objects, copyUserData.attrs);
  }
  function copyTo() {
    const frameRange = state.range;
    const objList = [] as AnnotateObject[];
    const attrs = editState.objects[0].userData.attrs;
    const trackId = editState.trackId[0];
    frameRange.forEach((index) => {
      const frame = editor.state.frames[index - 1];
      if (!frame) return;
      const objectArr = editor.dataManager.getFrameObject(frame.id);
      const trackObj = objectArr?.find((e) => e.userData.trackId == trackId);
      if (trackObj) objList.push(trackObj);
    });
    objList.length > 0 && updateCopyAttrs(objList, attrs);
  }
  function updateCopyAttrs(objects: AnnotateObject[], attrs: any) {
    attrs = JSON.parse(JSON.stringify(attrs));
    editor.cmdManager.execute('update-user-data', {
      objects: objects,
      data: {
        attrs,
      },
    });
  }
</script>

<style lang="less" scoped>
  .class-copy {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .copy-attr {
    display: flex;
    position: relative;
    align-items: center;
    width: 100%;
    height: 40px;
    color: white;

    .copy-icon {
      position: absolute;
      right: 10px;

      .icon {
        margin-left: 10px;
        font-size: 18px;
        cursor: pointer;

        :hover {
          color: #2e8cf0;
        }

        &.active {
          color: #2e8cf0;
        }
      }
    }
  }

  .copy-info {
    padding: 5px 10px;
    border: 1px solid #3a3a3a;
    width: 100%;
    text-align: left;

    .ant-slider {
      margin: 5px 13px;
      width: 250px;
      vertical-align: middle;
    }

    .copy-select {
      margin: 5px 0;
    }

    .ant-select {
      border: 1px solid #3a3a3a;
      width: 200px;
    }
  }

  .copy-btn {
    margin: 10px 0 5px;
    text-align: right;
  }

  .warn-tips {
    color: #d89614;
  }
</style>
