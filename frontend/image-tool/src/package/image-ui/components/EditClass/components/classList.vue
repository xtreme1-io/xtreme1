<template>
  <div class="class-search">
    <a-form-item :label="editor.lang('class')">
      <a-input
        v-model:value="thisSta.searchVal"
        class="search-input"
        :placeholder="editor.lang('Search Class')"
      />
    </a-form-item>
  </div>
  <div class="class-list" v-if="state.classList">
    <span
      :ref="classItemRef"
      :id="item.name"
      v-for="item in classList"
      :key="item.name"
      :class="{ 'item limit': true, active: state.classType === item.name }"
      @click="canEdit() ? onClassChange(item) : undefined"
      :style="{ color: item.color }"
    >
      <ToolIcon :tool="state.toolType" />&nbsp;{{ editor.showNameOrAlias(item) }}
    </span>
    <div ref="classAttrsCard" class="class-attrs-card">
      <div v-if="state.classType && state.attrs.length > 0" class="attr-container">
        <div class="attr-item" v-for="item in state.attrs" :key="state.classType + item.name">
          <AttrValue @change="onAttChange" :item="item" :isDisable="!canEdit()" />
        </div>
      </div>
    </div>
    <div class="warn-msg" :style="{ top: `${thisSta.msgTop}px` }">
      <Msgwarn
        @ok="onSureChangeClass"
        @cancel="onCancel"
        v-if="thisSta.showWarn && !thisSta.hideMsg"
      >
        <template #msg>
          {{ editor.lang('class_change_warn', { type: changeClass?.name }) }}
          <br />
          <a-checkbox class="checkbox-wrap" v-model:checked="thisSta.hideValue">{{
            editor.lang('not_show_anymore')
          }}</a-checkbox>
        </template>
      </Msgwarn>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue';
  import { useInjectEditor } from '../../../context';
  import { useInject } from '../context';
  import { IClassType, ToolIcon } from '../../../../image-editor';
  import useUI from '../../../hook/useUI';
  import AttrValue from './AttrValue.vue';
  import Msgwarn from './Msgwarn.vue';

  const emit = defineEmits(['onChangeClass', 'onChangeAttrs']);

  const { canEdit } = useUI();

  const state = useInject();
  const editor = useInjectEditor();
  const thisSta = reactive({
    hideMsg: false,
    hideValue: false,
    searchVal: '',
    showWarn: false,
    msgTop: 0,
    showHoverAttr: false,
  });
  const changeClass = ref<IClassType>();
  const classAttrsCard = ref();
  const refItemMap: Record<string, HTMLElement> = {};
  const classItemRef = (el: any) => {
    if (el) refItemMap[el.id] = el;
  };
  const classList = computed(() => {
    return state.classList.filter((classType) => {
      const name = classType.name + (classType.label || '');
      return name.indexOf(thisSta.searchVal) > -1 || !thisSta.searchVal;
    });
  });
  watch(
    () => editor.state.config.showClassView,
    () => {
      if (!editor.state.config.showClassView) {
        onCancel();
      }
    },
  );

  function onClassChange(classType: IClassType) {
    if (classType.id === state.classId) return;
    changeClass.value = classType;
    if (!state.classId || thisSta.hideMsg) onSureChangeClass();
    else {
      const itemDom = refItemMap[classType.name];
      const { top } = itemDom.getBoundingClientRect();
      const pTop = itemDom.parentElement?.getBoundingClientRect().top || 0;
      thisSta.msgTop = top - pTop + 35;
      thisSta.showWarn = true;
    }
  }
  function onSureChangeClass() {
    if (changeClass.value) {
      emit('onChangeClass', changeClass.value.id);
    }
    thisSta.hideMsg = thisSta.hideValue;
    onCancel();
  }
  function onCancel() {
    thisSta.showWarn = false;
    changeClass.value = undefined;
  }
  function onAttChange(name: string, value: any) {
    emit('onChangeAttrs', name, value);
  }
</script>

<style lang="less" scoped>
  .class-list {
    position: relative;
    z-index: 1;
    width: 306px;
    font-size: 14px;
    text-align: left;

    .disable {
      color: #a3a3a3 !important;
      filter: grayscale(100%);
      pointer-events: none;
    }
  }

  .item {
    display: inline-block;
    margin-right: 8px;
    margin-bottom: 8px;
    padding: 4px 6px;
    border-radius: 3px;
    max-width: 140px;
    background: #303036;
    white-space: nowrap;
    cursor: pointer;
    vertical-align: middle;

    .anticon,
    .iconfont {
      margin-right: 4px;
    }

    &.active,
    &:hover {
      background: #2e8cf0;
      color: white !important;
    }
  }

  .class-attrs-card {
    display: flex;
    width: 306px;
    flex-direction: column;

    .attr-container {
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 10px;
      border: 1px solid #6e6e6e;
    }
  }

  .warn-msg {
    position: absolute;
    left: 0;
    background-color: #393c45;

    .class-msg-item {
      padding: 5px 10px;
      font-size: 12px;
    }
  }

  .no-mouse-event {
    pointer-events: none;
  }
</style>
