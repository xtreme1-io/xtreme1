<template>
  <div
    style="height: 36px; background-color: #23262e; white-space: nowrap"
    @click.prevent="(e) => onClickTick(e)"
  >
    <div class="i-scale-head-container">
      <template v-for="(item, index) in configArray" :key="item.key">
        <div class="ruler-container" :style="_style(index)">
          <div v-if="_mark(index)" class="ruler-text">{{ index + 1 }}</div>
          <span :class="{ 'ruler-scale': true, bold: _mark(index) }"></span>
          <span :style="_style1(index)" class="loaded"></span>
        </div>
      </template>
    </div>
  </div>
  <div :style="{ left: iState.dragDomLeft + 'px' }" ref="indicatorRef" class="i-scale-indicator">
    <span class="i-scale-indicator-bar"></span>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, watch, ref, computed, onUnmounted } from 'vue';
  import { useInjectEditor } from '../../context';
  const editor = useInjectEditor();
  // interface & type & constant -------------------------------------
  const defaultConfig = {
    spanWidth: 20,
    interval: 5,
    animation: 1,
    emptyColor: '#C5C8CD',
    loadedColor: '#7acae8',
    activeColor: '#fcecc4',
  };

  interface Frame {
    id: number | string;
    resultExist?: boolean | string;
    hasAnnotate?: boolean;
    loadState: boolean | string;
  }

  interface frameProps {
    frames: Array<Frame>;
    status: Array<boolean>;
    config: {
      curFrameIndex: number;
      disabled?: boolean;
      //--
      activeColor?: string;
      emptyColor?: string;
      loadedColor?: string;
      interval?: number;
      spanWidth?: number;
      showProcess?: boolean;
    };
  }

  // emit & props -------------------------------------
  // const emit = defineEmits(['frameIndexChange']);

  const props = defineProps<frameProps>();

  const indicatorRef = ref<HTMLElement>();

  let parentElement: HTMLElement; // ref<HTMLElement | undefined>(undefined);
  const iState = reactive({
    containerWidth: 0,
    dragDomLeft: 0,
    isDrag: false,
  });

  // life

  onMounted(() => {
    addDragListener();
    addResizeListener();
    setTimeout(domResize, 2000);
  });

  onUnmounted(() => {
    removeEvent();
  });

  // data && computed && watch

  const _config = computed(() => {
    return Object.assign(defaultConfig, props.config || {});
  });

  const configArray = computed(() => {
    const headConfig = [];
    const width = _config.value.spanWidth;
    let temp = 0;
    const maxWidth = Math.max(width * props.frames.length, iState.containerWidth);
    while (temp + width <= maxWidth) {
      headConfig.push({
        key: temp,
      });
      temp += width;
    }
    return headConfig;
  });

  watch(
    () => props.config.curFrameIndex,
    () => {
      checkPosition();
      checkView();
    },
    { immediate: true },
  );

  watch(
    () => props.config.spanWidth,
    () => {
      checkPosition();
    },
  );
  // methods
  const _mark = (index: number) => {
    return (index + 1) % _config.value.interval === 0 || index === 0;
  };

  function addResizeListener() {
    if (indicatorRef.value) {
      parentElement = (indicatorRef.value as HTMLElement).parentElement as HTMLElement;
      if (!parentElement) return;
      if (!iState.containerWidth) {
        iState.containerWidth = parentElement.offsetWidth;
      }
      window.addEventListener('resize', domResize);
    }
  }

  function domResize() {
    if (parentElement) {
      const dom = parentElement as HTMLElement;
      iState.containerWidth = dom.offsetWidth;
    }
  }

  function removeEvent() {
    if (parentElement) {
      (parentElement as HTMLElement).onmousedown = null;
    }
    if (indicatorRef.value) {
      (indicatorRef.value as HTMLElement).onmousedown = null;
    }
    window.removeEventListener('resize', domResize);
  }

  function checkPosition() {
    const width = _config.value.spanWidth;
    iState.dragDomLeft = props.config.curFrameIndex * width - width / 2 - 2;
  }

  function checkView() {
    if (parentElement) {
      const container = parentElement as HTMLElement;
      const width = _config.value.spanWidth;
      const needWidth = props.config.curFrameIndex * width;
      const scrollX = container.scrollLeft;
      const total = container.offsetWidth;
      const offset = width;
      if (scrollX + total < needWidth + offset) {
        container.scrollLeft = needWidth - total + offset;
      } else if (scrollX > needWidth - width - offset) {
        container.scrollLeft = needWidth - width - offset;
      }
    }
  }
  const _style1 = (index: number) => {
    const style: Partial<Record<keyof CSSStyleDeclaration, any>> = {
      backgroundColor: 'transparent',
    };
    const item = props.frames[index] as any;
    if (item) {
      switch (item.loadState) {
        case true:
        case 'complete':
          style.backgroundColor = '#2B3452';
          break;
        case 'err':
        case 'error':
        case false:
          style.backgroundColor = '#ff0000';
          break;
        default:
          break;
      }
    }
    return style;
  };
  const _style = (index: number) => {
    const item: any = props.frames[index] || {};
    // const { loadedColor, emptyColor } = _config.value;
    const style: Partial<Record<keyof CSSStyleDeclaration, any>> = {
      width: _config.value.spanWidth + 'px',
    };
    if (item.isSample) {
      const itemPre: any = props.frames[index - 1];
      const itemNext: any = props.frames[index + 1];
      const border = '1px solid #e2e3a7';
      style.borderTop = border;
      style.borderBottom = border;
      if (!itemPre?.isSample) {
        style.borderLeft = border;
      }
      if (!itemNext?.isSample) {
        style.borderRight = border;
      }
    }
    return style;
  };
  function preMouseEvent(e: MouseEvent) {
    e.stopPropagation && e.stopPropagation();
    e.preventDefault && e.preventDefault();
    e.cancelBubble = true;
  }

  function getFrameIndexByEvent(event: MouseEvent): number {
    const frameIndex = Math.ceil(event.offsetX / _config.value.spanWidth);
    return frameIndex;
  }

  function onClickTick(event: MouseEvent) {
    const index = getFrameIndexByEvent(event);
    onChangeFrameIndex(index);
  }

  function onChangeFrameIndex(index: number) {
    // let beforeIndex = editor.state.frameIndex + 1;
    if (index > props.frames.length) {
      index = props.frames.length;
      return false;
    }
    editor.loadFrame(index - 1); // emit('frameIndexChange', index);
    // editor.reportManager.reportChangeFrame('Time Line', beforeIndex);
    return true;
  }
  function addDragListener() {
    if (indicatorRef.value) {
      const dom = indicatorRef.value as HTMLElement;
      let divX: number;
      let maxX: number;
      let tempDragDomLeft: number;
      const onMouseMove = (e: MouseEvent) => {
        const x = e.clientX - divX;
        preMouseEvent(e);
        divX = e.clientX;
        const tempX = iState.dragDomLeft + x;
        if (tempX <= maxX && tempX > 0) {
          iState.dragDomLeft += x;
        }
      };
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        if (iState.isDrag) {
          iState.isDrag = false;
          const width = _config.value.spanWidth;
          const index = Math.ceil(iState.dragDomLeft / width);
          if (index === props.config.curFrameIndex) {
            iState.dragDomLeft = tempDragDomLeft;
          } else {
            onChangeFrameIndex(index);
          }
        }
      };
      dom.onmousedown = function (e) {
        e = e || window.event;
        preMouseEvent(e);
        if (e.button === 2) return;
        tempDragDomLeft = iState.dragDomLeft;
        iState.isDrag = true;
        divX = e.clientX;
        const width = _config.value.spanWidth;
        maxX = width * props.frames.length;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      };
    }
  }
</script>
<style lang="less">
  .i-scale-indicator {
    // background: aquamarine;
    position: absolute;
    top: 6px;
    bottom: 0;
    z-index: 7;
    width: 4px;
    pointer-events: none;

    &::after {
      position: absolute;
      top: 6px;
      left: 50%;
      width: 1px;
      height: 100%;
      background-color: #ffffff;
      content: '';
      transform: translateX(-50%);
    }

    .i-scale-indicator-bar {
      display: block;
      position: absolute;
      top: 1px;
      left: 50%;
      z-index: 3;
      width: 16px;
      height: 18px;
      background-position: center;
      background-repeat: no-repeat;
      background-size: 100% 100%;
      pointer-events: auto;
      transform: translateX(-50%);
      background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxNS45OTciIHZpZXdCb3g9IjAgMCAxMiAxNS45OTciPg0KICA8cGF0aCBpZD0i6Lev5b6EXzIzNDYyIiBkYXRhLW5hbWU9Iui3r+W+hCAyMzQ2MiIgZD0iTTM4My45NjYsNDE5LjI1OGw1LjcwNS0zLjY3NFY0MDMuNjI5YzAtLjE2Mi0uMTgxLS4yOTMtLjQtLjI5MWgtMTEuMmMtLjIxNywwLS40LjEyOS0uNC4yOTFsMCwxMS45NTUsNS43LDMuNjcyQS42LjYsMCwwLDAsMzgzLjk2Niw0MTkuMjU4WiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTM3Ny42NzIgLTQwMy4zMzgpIiBmaWxsPSIjZmZmZmZmIi8+DQo8L3N2Zz4=');
      cursor: grab;
    }

    .disabled {
      cursor: not-allowed;
    }

    .active {
      cursor: grab;
    }

    // .i-tool-scale-head:hover {
    //     background: #89d1f8;
    // }

    .i-tool-scale-body {
      display: block;
      position: absolute;
      top: 6px;
      bottom: 0;
      left: 50%;
      width: 1px;
      border-left: 1px solid #1296db;
      transform: translateX(-50%);
    }
  }

  .i-scale-head-container {
    display: inline-block;
    overflow: hidden;
    height: 100%;
    cursor: pointer;

    .ruler-container {
      display: inline-block;
      position: relative;
      height: 100%;
      background-color: #23262e;
      // background-color: #292746;
      pointer-events: none;
      user-select: none;

      &.active {
        background-color: #1d3f64;
      }

      .ruler-text {
        position: absolute;
        bottom: 0;
        z-index: 4;
        width: 100%;
        font-size: 12px;
        text-align: center;
        color: #aaaaaa;
        line-height: 36px;
        pointer-events: none;
      }

      .loaded {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 0;
        height: 100%;
        box-shadow: inset 0 -1px 0 #43454b;
      }

      .ruler-scale {
        position: absolute;
        bottom: 0;
        left: 50%;
        z-index: 1;
        width: 1px;
        height: 6px;
        border-left: 1px solid #666666;
        transform: translateX(-0.5px);
      }

      .bold {
        border-width: 1px;
        border-color: #cecfd5;
        height: 10px;
      }
    }
  }
  // }
</style>
