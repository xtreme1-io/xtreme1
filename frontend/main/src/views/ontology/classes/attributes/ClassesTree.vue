<template>
  <div class="tree__title">{{ t('business.ontology.modal.treeGraph') }}</div>
  <Tree
    v-if="showTree"
    :selectedKeys="selectedKeys"
    :show-line="showLine"
    :treeData="treeData"
    :replace-fields="replaceFields"
    :show-icon="showIcon"
    defaultExpandAll
    autoExpandParent
    @select="handleSelect"
    class="classes-tree"
  >
    <template #title="{ type, name }">
      <span :class="[type, props.activeTab]">{{ name }}</span>
    </template>
  </Tree>
</template>
<script lang="ts" setup>
  import { ref, unref, reactive, watch, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Tree } from 'ant-design-vue';
  import emitter from 'tiny-emitter/instance';
  import { clone } from '/@/utils/business/deepClone';
  import { ClassTypeEnum } from '/@/api/business/model/classesModel';

  const { t } = useI18n();
  const showLine = ref<boolean>(true);
  const showIcon = ref<boolean>(false);
  const replaceFields = { title: 'name' };

  const props = defineProps<{
    activeTab: ClassTypeEnum;
    dataSchema?: any;
    indexList?: number[];
  }>();

  // Node name, default is Root
  const rootName = ref('Root');
  // Triggered by baseForm, to change the rootName
  emitter.off('changeRootName');
  emitter.on('changeRootName', (newName) => {
    rootName.value = newName;
  });

  // tree data before processing
  let TreeData = ref<any>({});
  // Listening to changes in attributes | options to process tree data
  watch(
    props,
    (newVal) => {
      const temp = clone(newVal.dataSchema);
      handleTreeData(temp, '0');
      TreeData.value = reactive(temp);
    },
    {
      immediate: true,
    },
  );

  // Monitor tree data changes -- switch the display of tree components
  const showTree = ref<boolean>(true);
  watch(TreeData, () => {
    showTree.value = false;
    setTimeout(() => {
      showTree.value = true;
    });
  });
  // processed tree data -- for display
  const treeData = computed(() => {
    return [
      {
        key: 'root',
        type: 'root',
        name: rootName.value,
        children: TreeData.value.children,
      },
    ];
  });

  // For processing TreeData , plus the children field
  function handleTreeData(treeData, indexKey: string) {
    if (!treeData) treeData = {};
    treeData.children = [];
    if (treeData.hasOwnProperty('attributes')) {
      treeData.children = treeData.attributes;
      treeData.key = indexKey;
      treeData.type = 'attributes';
    } else if (treeData.hasOwnProperty('options')) {
      treeData.key = indexKey;
      treeData.children = treeData.options;
      treeData.type = 'options';
    }

    if (treeData?.children?.length > 0) {
      treeData.children.forEach((item, index) => {
        handleTreeData(item, indexKey + index);
      });
    }
  }

  // The selected node, defaults to root
  const selectedKeys = ref(['root']);
  // Monitor indexList, process selection
  watch(
    () => props.indexList,
    (newVal) => {
      const arr = unref(newVal);
      let temp = '';
      if (!arr) {
        temp = 'root';
      } else if (arr.length == 0) {
        temp = 'root';
      } else {
        temp = '0' + arr.join('');
      }
      selectedKeys.value = [temp];
    },
    {
      deep: true,
    },
  );

  // click node event
  const emits = defineEmits(['select']);
  const handleSelect = (newSelectedKeys: string[]) => {
    if (newSelectedKeys.length != 0) {
      selectedKeys.value = newSelectedKeys;
      emits('select', unref(newSelectedKeys));
    }
  };
  // change node
  emitter.off('changeSelected');
  emitter.on('changeSelected', (newSelectedKeys) => {
    selectedKeys.value = newSelectedKeys;
  });
</script>
<style lang="less">
  .tree__title {
    font-weight: 500; //font-weight: 600;

    font-size: 16px;
    line-height: 19px;

    color: #333333;
  }
  .classes-tree {
    width: 100%;
    height: 100%;
    overflow: auto;
    // node container
    li {
      .ant-tree-node-content-wrapper {
        display: inline-flex;
        align-content: center;
        align-items: center;
        box-sizing: border-box;
        padding: 0;
        font-size: 12px;
        color: #333;

        &.ant-tree-node-selected {
          background-color: transparent;
          padding: 0;

          .ant-tree-title {
            .root,
            .attributes,
            .options {
              border: 3px solid #7ff0b3 !important;
            }
            // line-height: 18px;
          }
        }

        &:hover {
          .ant-tree-title {
            .root,
            .attributes,
            .options {
              color: #57ccef;
              border: 1px solid transparent;
            }
          }
        }

        .ant-tree-title {
          z-index: 3;

          .root,
          .attributes,
          .options {
            padding: 2px 10px;
            border-radius: 4px;
            color: #666;
            border: 1px solid #cccccc;
            background-color: #f7f7f7;
            transition: 0.3s;
          }

          .root {
            background: #e6f7fd;
          }

          .options {
            &.CLASS {
              background: #e6f7fd;
            }
          }

          .attributes {
            &.CLASSIFICATION {
              background: #e6f7fd;
            }
          }
          // .attributes {
          //   color: #333;
          //   border: 1px solid transparent;
          //   background: #e6f7fd;
          // }
        }
      }
    }
    // child node
    .ant-tree-child-tree {
      position: relative;

      & > li {
        padding-top: 8px;
        position: relative;
        // child node left
        &:not(:last-child)::before {
          left: -6px;
          height: 100%;
          margin: 0;
        }

        &::after {
          content: '';
          position: absolute;
          top: -5.5px;
          left: -6px;
          display: inline-block;
          width: 31px;
          height: 26px;
          border: 1px solid #cccccc;
          border-width: 0 0 1px 1px;
          border-radius: 0 6px;
          z-index: 1;
        }
      }
    }
    // icon
    .ant-tree-switcher {
      background-color: transparent !important;
      z-index: 2;
      // hide default icon
      .anticon {
        svg {
          display: none;
        }
      }

      // Open icon replacement
      &.ant-tree-switcher_open {
        background: url('/@/assets/svg/ontology/minus.svg') no-repeat center center !important;

        i {
          display: none !important;
        }
      }

      &.ant-tree-switcher_close {
        background: url('/@/assets/svg/ontology/plus.svg') no-repeat center center !important;

        i {
          display: none !important;
        }
      }
      // Hide the previous default icon
      &.ant-tree-switcher-noop {
        // width: 0 !important;
        i {
          display: none !important;
        }
      }
    }

    & > .ant-tree-treenode-switcher-open {
      & > .ant-tree-switcher {
        display: none;
        z-index: 2;
      }
    }
  }
</style>
