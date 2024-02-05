<template>
  <div class="header-content">
    <div class="header-title">{{ props.title }}</div>
    <span class="info-count">({{ resultState.objectN }})</span>
    <div class="tool header-tool">
      <!-- filter -->
      <Filter />
      <!-- delete -->
      <i
        class="icon iconfont icon-delete"
        v-show="canEdit()"
        @click.stop="onDelete"
        :title="editor.lang('Delete')"
      />
      <!-- setting -->
      <Setting />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useInjectBSEditor } from '../../../context';
  import { useResultsInject } from './context';
  import useUI from '../../../hook/useUI';

  import Filter from './components/Filter.vue';
  import Setting from './components/Setting.vue';

  const props = defineProps<{ title: string }>();

  const editor = useInjectBSEditor();
  const { resultState } = useResultsInject();
  const { canEdit } = useUI();

  function onDelete() {
    const frame = editor.getCurrentFrame();
    let objects = editor.dataManager.getFrameObject(frame.id) || [];

    if (objects.length > 0) {
      editor
        .showConfirm({
          title: editor.lang('Delete'),
          subTitle: editor.lang('Delete {num} Objects?', { num: objects.length }),
          okText: editor.lang('Delete'),
          cancelText: editor.lang('Cancel'),
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
</style>
