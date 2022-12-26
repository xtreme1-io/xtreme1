<template>
  <div class="h-36px inline-flex gap-10px items-center">
    <ImportModal @register="importRegister" type="ONTOLOGY" />
    <Dropdown placement="bottomRight" trigger="click" overlayClassName="headerDropdown">
      <div class="ellipsis_box">
        <Icon class="ellipsis_box-icon" icon="gridicons:ellipsis" :size="18" />
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
  import { useModal } from '/@/components/Modal';
  import ImportModal from '../../../datasets/datasetOntology/components/import-modal/ImportModal.vue';
  import { useRoute } from 'vue-router';
  const { query } = useRoute();
  const { id } = query;
  const [importRegister, { openModal: openImportModal }] = useModal();
  const handleImport = () => {
    openImportModal();
  };
  const handleExport = async () => {
    // await exportClass({
    //   sourceId: id,
    //   sourceType: 'ONTOLOGY',
    //   responseType: 'blob',
    // });
    window.open(
      window.location.origin + '/api/ontology/exportAsJson' + `?sourceId=${id}&sourceType=ONTOLOGY`,
    );
    // downloadByData(res, 111);
    // downloadByUrl()
  };
</script>
<style lang="less" scoped>
  .ellipsis_box {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    width: 44px;
    border-radius: 8px;
    border-width: 4px;
    background-color: #ddebff;
    border-color: #fff;
    box-shadow: 0 0 0 1px #ccc;
    transition: all 0.3s;
    &:hover {
      box-shadow: 0 0 0 1px @primary-color;
    }
    cursor: pointer;
    &-icon {
      color: @primary-color;
    }
  }
</style>
<style lang="less">
  .headerDropdown {
    // width: 220px;
    border-radius: 8px;
    overflow: hidden;
    background-color: #ffffff;
    box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.15);
    .ant-dropdown-menu {
      padding: 8px 0;
      overflow: hidden;
      box-shadow: none;
      .ant-dropdown-menu-item {
        &:hover {
          background: #e6f0fe;
        }
      }
    }
  }
</style>
