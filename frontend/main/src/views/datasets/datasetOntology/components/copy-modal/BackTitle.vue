<template>
  <div class="inline-block">
    <div class="flex items-center cursor-pointer">
      <Icon
        icon="eva:arrow-back-fill"
        color="#aaa"
        class="mr-10px"
        size="24px"
        @click="handleBack"
      />
      <span style="color: #666; font-size: 18px">
        {{ props.title }}
      </span>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { Icon } from '/@/components/Icon';

  const props = defineProps<{ title: string }>();
  const emits = defineEmits(['back']);

  const handleBack = () => {
    emits('back');
  };
</script>
