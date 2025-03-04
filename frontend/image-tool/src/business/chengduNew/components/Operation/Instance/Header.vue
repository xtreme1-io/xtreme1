<template>
  <div class="header-content">
    <div class="header-title">{{ props.title || t('image.Result') }}</div>
    <span class="info-count">({{ state.currentList.objectN }})</span>

    <div class="tool header-tool">
      <a-popover
        :title="t('image.Filter')"
        placement="bottomRight"
        :trigger="['click']"
        overlayClassName="result-header-filter"
      >
        <IconFilter />
        <template #content>
          <Filter />
        </template>
      </a-popover>
      <IconDelete class="icon" v-show="canEdit()" @click="onDelete" :title="t('image.Delete')" />
      <a-popover
        overlayClassName="result-header-show"
        :title="t('image.Setting')"
        placement="bottomRight"
        :trigger="['click']"
      >
        <IconVerticalMore @click.stop />
        <template #content>
          <a-row class="setting-item">
            <a-col :span="16" class="title">
              <span class="item-title">{{ t('image.Show Size') }}</span>
            </a-col>
            <a-col :span="8">
              <a-switch
                size="small"
                v-model:checked="config.showSize"
                checked-children="On"
                un-checked-children="Off"
                @change="onChange"
              />
            </a-col>
          </a-row>
          <a-row class="setting-item">
            <a-col :span="16" class="title">
              <span class="item-title">{{ t('image.Show Attr') }}</span>
            </a-col>
            <a-col :span="8">
              <a-switch
                size="small"
                v-model:checked="config.showAttrs"
                checked-children="On"
                un-checked-children="Off"
                @change="onChange"
              />
            </a-col>
          </a-row>
          <a-row class="setting-item" v-if="showAll">
            <a-col :span="16" class="title">
              <span class="item-title">{{ t('image.Show All Objects') }}</span>
            </a-col>
            <a-col :span="8">
              <a-switch
                size="small"
                :disabled="state.listMode === 'layer'"
                v-model:checked="config.showAllObject"
                checked-children="On"
                un-checked-children="Off"
                @change="onChange"
              />
            </a-col>
          </a-row>
        </template>
      </a-popover>
    </div>
    <div v-show="!canOperate()" class="over-not-allowed"></div>
  </div>
</template>

<script setup lang="ts">
  import { IconFilter, IconDelete, IconVerticalMore } from '@basicai/icons';
  import { useInjectBSEditor } from '../../../context';
  import { useUI } from 'image-ui/hook';
  import Filter from './Filter.vue';
  import { IState } from './type';
  import { ToolModelEnum, utils } from 'image-editor';
  import { useInject } from './context';
  import { computed } from 'vue';
  import { t } from '@/lang';

  const props = defineProps<{ title: string; state: IState }>();

  const { onUpdateList } = useInject();
  const { canEdit, canOperate } = useUI();
  const editor = useInjectBSEditor();
  const { bsState } = editor;
  const config = editor.state.config;

  const showAll = computed(() => {
    return editor.state.isSeriesFrame && editor.state.imageToolMode === ToolModelEnum.INSTANCE;
  });

  function onChange() {
    onUpdateList();
  }

  function onDelete() {
    const { currentSource } = bsState;
    const frame = editor.getCurrentFrame();
    let objects = editor.dataManager.getFrameObject(frame.id) || [];

    objects = objects.filter((e) => {
      const userData = editor.getUserData(e);
      const sourceId = userData.sourceId || '-1';
      return sourceId === currentSource;
    });

    const flatObjects = utils.flatObjects(objects);

    if (objects.length > 0) {
      editor
        .showConfirm({
          title: t('image.Delete'),
          subTitle: t('image.DeleteNumObjects', { num: flatObjects.length }),
          okText: t('image.Delete'),
          cancelText: t('image.Cancel'),
          okDanger: true,
        })
        .then(
          () => {
            editor.cmdManager.execute('delete-object', objects);
          },
          () => {},
        );
    }
  }
</script>

<style lang="less">
  .header-content {
    flex: 1;
    display: flex;

    .header-title {
      overflow: hidden;
      max-width: 100px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .header-tool {
      position: absolute;
      right: 0;
    }
  }

  .filte-active {
    color: @primary-color;
  }

  .ant-dropdown {
    background: #333333;

    .ant-menu {
      background-color: transparent;
    }

    .ant-menu-vertical > .ant-menu-item {
      height: 30px;
      line-height: 30px;
      color: #a7a7a7;
    }
  }

  .result-header-show {
    .setting-item {
      margin: 4px 0;
    }

    .item-title {
      font-size: 12px;
    }
  }

  .result-header-filter {
    max-width: 500px;

    .ant-popover-inner-content {
      overflow: auto;
      max-height: 60vh;
    }

    .filter {
      position: absolute;
      top: 40px;
      right: 16px;
      padding: 12px 16px;
      border-radius: 4px;
      z-index: 10;
      overflow-x: hidden;
      background-color: #1f1f1f;
      color: rgb(255 255 255 / 85%);
    }

    .filter-title {
      margin: 0;
      padding: 5px 16px 4px;
      min-width: 177px;
      min-height: 32px;
      color: rgb(255 255 255 / 85%);
      font-weight: 500;
      border-bottom: 1px solid #303030;
    }

    .filter-body {
      overflow: overlay;
      max-height: 400px;
      color: rgb(255 255 255 / 85%);
    }

    .filter-divider {
      margin-top: 10px;
      width: 100%;
      height: 1px;
      background-color: #303030;
      // transform: scaleX(2);
    }

    .filter-footer {
      display: flex;
      padding-top: 10px;
      justify-content: space-between;
    }
  }
</style>
