<template>
  <Teleport to="body">
    <BasicModal @register="register" v-bind="attrs" :style="style">
      <slot></slot>
    </BasicModal>
  </Teleport>
</template>
<script lang="ts" setup>
  import { toRaw, CSSProperties, useAttrs, defineEmits, onMounted } from 'vue';
  import { useModalInner, BasicModal } from '/@/components/Modal';
  import { basicProps } from './typing';
  const attrs = useAttrs();
  const props: any = defineProps(basicProps);
  const style: CSSProperties = {};
  const [register, { setModalProps }] = useModalInner();
  // console.log(JSON.parse(JSON.stringify(toRaw(props))));
  onMounted(() => {
    const modalData = {
      ...toRaw(props),
    };
    Object.assign(modalData, { width: 720, height: 540 });
    setModalProps(modalData);
  });
  defineEmits(['register']);
</script>
