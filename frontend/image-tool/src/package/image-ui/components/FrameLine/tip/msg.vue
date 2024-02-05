<template>
  <teleport to="body">
    <div v-show="iState.visible" class="timeline-message" :style="iState.style" ref="popContainer">
      <div
        style="
          padding: 1px 8px;
          border-radius: 2px;
          background: #303036;
          font-size: 12px;
          color: white;
          box-shadow: 0 0 10px -2px #1e1f23;
        "
      >
        <span :style="{ color: iState.color }">
          <div v-for="msg in iState.msg" :class="msg.class">{{ msg.msg }}</div>
        </span>
      </div>
    </div>
  </teleport>
</template>
<script lang="ts" setup>
  import { onMounted, reactive } from 'vue';
  import { IBottomState, IMsgOption } from '../useBottom';
  const props = defineProps<{
    state: IBottomState;
  }>();
  const iState = reactive({
    style: { left: 0, top: 0 },
    visible: false,
    color: '#ffffff',
    placement: 'top',
    msg: [] as any[],
  });
  onMounted(() => {
    props.state.tip = (option: IMsgOption) => {
      const {
        visible,
        target,
        data: { msg },
      } = option;
      Object.assign(iState, {
        visible: visible,
        msg: msg,
      });
      updatePosition(target);
    };
  });
  function updatePosition(target: { x: number; y: number }) {
    if (!iState.visible) return;
    const style: any = {};
    switch (iState.placement) {
      default:
      case 'top':
        style.bottom = target.y + 'px';
        style.left = target.x + 'px';
        break;
    }

    iState.style = style;
  }
</script>
<style lang="less">
  .timeline-message {
    position: absolute;
    z-index: 707;
    min-width: 20px;
  }
</style>
