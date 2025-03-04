<template>
  <div>{{ t('image.class') }}</div>
  <Tree
    class="filter-tree"
    :treeData="classesTreeOption.treeData"
    defaultExpandAll
    checkable
    checkStrictly
    :checkedKeys="classesProxyValue"
    @check="handleCheckClasses"
    :selectable="false"
  >
  </Tree>

  <div>{{ t('image.Tool') }}</div>
  <Tree
    class="filter-tree"
    defaultExpandAll
    checkable
    :treeData="classesTreeOption.treeToolData"
    v-model:checkedKeys="bsState.filterTools"
    @check="() => editor.loadManager.loadDataFromManager()"
    :selectable="false"
  >
  </Tree>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { __ALL__ as ALL, IClassTypeItem } from 'image-editor';
  import { useInjectBSEditor } from '../../../context';
  import { Tree } from 'ant-design-vue';
  import { t } from '@/lang';
  import { ToolTypeEnum } from '@basicai/tool-components';

  const editor = useInjectBSEditor();
  const { bsState } = editor;

  const handleCheckClasses = (data: any, node: any) => {
    let checked: string[] = data.checked;
    const allKeys = classesTreeOption.value.allKeys;
    if (node.node.key == ALL) {
      checked = node.node.checked ? [] : allKeys;
    } else {
      const checkedWithOutAll = checked.filter((e) => e != ALL);
      if (checkedWithOutAll.length == allKeys.length - 1) {
        checked = [ALL, ...checkedWithOutAll];
      } else {
        checked = checkedWithOutAll;
      }
    }
    classesProxyValue.value = checked;
    editor.loadManager.loadDataFromManager();
  };
  const getKeys = <T extends { key: string; children: T[] }>(item: T[]): string[] => {
    return item.reduce((keys: string[], i: T) => {
      return [...keys, i.key, ...getKeys(i.children)];
    }, [] as string[]);
  };
  const classesTreeOption = computed(() => {
    const classes = editor.getClassTypesByToolmode(editor.state.imageToolMode);
    const childrenMap = classes.reduce<Record<string, IClassTypeItem[]>>(
      (m, item: IClassTypeItem) => {
        if (item.parentId) {
          if (!m[item.parentId]) m[item.parentId] = [];
          m[item.parentId].push(item);
        }
        return m;
      },
      {},
    );
    const treeData = [
      {
        title: t('image.all'),
        key: ALL,
        children: classes
          .filter((e) => !e.parent)
          .map(function createClassDataOption(item: IClassTypeItem): any {
            return {
              title: editor.getLabel(item),
              key: item.id,
              children: (childrenMap[item.id] || []).map(createClassDataOption),
            };
          }),
      },
    ];
    const toolTypeLang: Partial<Record<ToolTypeEnum, string>> = {
      [ToolTypeEnum.KEY_POINT]: t('image.KeyPoints'),
      [ToolTypeEnum.GROUP]: t('image.groupTips'),
      [ToolTypeEnum.BOUNDING_BOX]: t('image.rectTips'),
      [ToolTypeEnum.RECTANGLE]: t('image.rectTips'),
      [ToolTypeEnum.POLYGON]: t('image.polygonTips'),
      [ToolTypeEnum.POLYGON_PLUS]: t('image.polygonTips'),
      [ToolTypeEnum.POLYLINE]: t('image.lineTips'),
      [ToolTypeEnum.ELLIPSE]: t('image.ellipseTips'),
      [ToolTypeEnum.CIRCLE]: t('image.circleTips'),
      [ToolTypeEnum.CURVE]: t('image.curveTips'),
      [ToolTypeEnum.SKELETON]: t('image.skeletonTips'),
      [ToolTypeEnum.IMAGE_CUBOID]: t('image.cuboidTips'),
      [ToolTypeEnum.MASK]: t('image.Segmentation'),
    };
    const treeToolData = [
      {
        key: ALL,
        title: t('image.all'),
        children: Array.from(new Set(classes.map((c) => c.toolType))).map((e) => {
          return {
            key: e,
            title: toolTypeLang[e] || e,
          };
        }),
      },
    ];
    return {
      treeData: treeData,
      treeToolData: treeToolData,
      allKeys: getKeys(treeData),
    };
  });
  const classesProxyValue = computed({
    get() {
      if (bsState.filterClasses.length == 1 && bsState.filterClasses.includes(ALL))
        return classesTreeOption.value.allKeys;
      return bsState.filterClasses;
    },
    set(value: string[]) {
      bsState.filterClasses = value;
    },
  });
</script>
