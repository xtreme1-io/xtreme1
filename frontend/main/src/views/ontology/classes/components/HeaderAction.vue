<template>
  <div class="h-36px inline-flex gap-10px items-center">
    <Dropdown placement="bottomRight">
      <div class="flex items-center justify-center h-36px w-44px rounded-8px border-4 bg-white">
        <Icon style="cursor: pointer; color: #aaa" icon="gridicons:ellipsis" :size="18" />
      </div>
      <template #overlay>
        <Menu>
          <Menu.Item @click="handleImport">
            <div class="flex gap-10px items-center">
              <SvgIcon class="icon" name="ontology-import" />
              <div class="title">
                {{ 'Import by Json' }}
              </div>
            </div>
          </Menu.Item>
          <Menu.Item @click="handleExport">
            <div class="flex gap-10px items-center">
              <SvgIcon class="icon" name="ontology-export" />
              <div class="title">
                {{ 'Export Json' }}
              </div>
            </div>
          </Menu.Item>
        </Menu>
      </template>
    </Dropdown>
  </div>
</template>
<script lang="ts" setup>
  import Icon, { SvgIcon } from '/@/components/Icon';
  import { Dropdown, Menu } from 'ant-design-vue';

  /** Import */
  const handleImport = () => {};

  /** Export */
  const handleExport = () => {};
</script>
<style lang="less" scoped></style>
