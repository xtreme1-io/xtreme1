<template>
  <a-tree
    v-if="showTree"
    v-model:selectedKeys="selectedKeys"
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
  </a-tree>
</template>
<script lang="ts" setup>
  import { ref, unref, reactive, watch, computed } from 'vue';
  // 组件
  import { Tree } from 'ant-design-vue';
  import emitter from 'tiny-emitter/instance';
  // 工具
  import { clone } from '/@/utils/business/deepClone';
  import { ClassTypeEnum } from '/@/api/business/model/ontologyClassesModel';

  // 注册组件
  const ATree = Tree;

  const showLine = ref<boolean>(true);
  const showIcon = ref<boolean>(false);
  const replaceFields = { title: 'name' };

  const props = defineProps<{
    activeTab: ClassTypeEnum;
    dataSchema?: any;
    indexList?: number[];
  }>();

  // 节点名称, 默认为 Root
  const rootName = ref('Root');
  // 由 baseForm 触发，改变 rootName
  emitter.off('changeRootName');
  emitter.on('changeRootName', (newName) => {
    rootName.value = newName;
  });

  // 处理前的树形数据
  let TreeData = ref<any>({});
  // 监听到 attributes | options 改变就处理树形数据
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
  // 监听树形数据变化 -- 切换树形组件显示
  const showTree = ref<boolean>(true);
  watch(TreeData, () => {
    showTree.value = false;
    setTimeout(() => {
      showTree.value = true;
    });
  });
  // 处理后的树形数据 -- 用于显示
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

  // 用于处理 TreeData ，加上 children 字段
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

  // 选中的节点，默认为 root
  const selectedKeys = ref(['root']);
  // 监听 indexList,处理选中
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

  // 点击节点事件
  const emits = defineEmits(['select']);
  const handleSelect = (selectedKeys: string[]) => {
    // 先提交当前表单
    // emitter.emit('handleSaveForm', { type: 'tree', selectedKeys: selectedKeys });
    emits('select', unref(selectedKeys));
    // if (selectedKeys[0] == 'root') {
    //   emits('select', ['']);
    // } else {
    // }
  };
  // 改变节点
  emitter.off('changeSelected');
  emitter.on('changeSelected', (newSelectedKeys) => {
    console.log('tree changeSelected', newSelectedKeys);
    selectedKeys.value = newSelectedKeys;
  });
</script>
<style lang="less">
  .classes-tree {
    width: 100%;
    height: 100%;
    overflow: auto;
    // 节点容器
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
    // 子节点
    .ant-tree-child-tree {
      position: relative;

      & > li {
        padding-top: 8px;
        position: relative;
        // 子节点左边连线
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
    // 图标
    .ant-tree-switcher {
      background-color: transparent !important;
      z-index: 2;
      // 隐藏默认图标
      .anticon {
        svg {
          display: none;
        }
      }

      //打开图标的更换
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
      // 把之前的默认图标隐藏
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
