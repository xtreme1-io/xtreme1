<template>
  <div class="polygon-direction">
    <div
      class="direction-arrow"
      v-for="item in data"
      :key="item.id"
      :style="{
        transform: `translate(${item.x}px, ${item.y}px) translate(-50%, -50%) rotate(${item.r}deg)`,
      }"
      @mouseover="onMouseHover(item, true)"
      @mouseout="onMouseHover(item, false)"
      @click="onDirection(item)"
    >
      <img :src="direction" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { IPolygonInnerConfig, Line, OPType, Polygon, Shape, Vector2 } from 'image-editor';
  import { useInjectEditor } from '../../context';
  import { IDirection } from './useDirection';
  import direction from '@/assets/direction.svg';

  defineProps<{ data: IDirection[] }>();
  const editor = useInjectEditor();

  function onDirection(item: IDirection) {
    if (editor.state.modeConfig.op === OPType.VIEW) return;
    const object = editor.dataManager.getObject(item.id) as Shape;
    if (!object) return;
    const { points, innerPoints } = object.attrs;
    const pointsData: { points: Vector2[]; innerPoints?: IPolygonInnerConfig[] } = { points: [] };
    if (object instanceof Polygon) {
      const [p1, ...others] = points;
      pointsData.points = [p1, ...others.reverse()];
      pointsData.innerPoints = [];
      if (innerPoints?.length > 0) {
        innerPoints.forEach((inner: IPolygonInnerConfig) => {
          if (!inner.points) return;
          pointsData.innerPoints?.push({ points: [...inner.points].reverse() });
        });
      }
    } else if (object instanceof Line) {
      pointsData.points = [...points].reverse();
    }
    editor.cmdManager.execute('update-points', {
      object,
      pointsData,
    });
  }
  function onMouseHover(item: IDirection, state: boolean) {
    const object = editor.dataManager.getObject(item.id) as Polygon;
    if (!object) return;
    object.state.hover = state;
    editor.mainView.updateStateStyle([object]);
  }
</script>

<style lang="less" scoped>
  .polygon-direction {
    position: absolute;
    user-select: none;

    .direction-arrow {
      position: absolute;
      line-height: 20px;
      transform-origin: 50% 50%;
      color: #e83c3c;
      cursor: pointer;

      img {
        width: 20px;
        height: 20px;
      }
    }
  }
</style>
