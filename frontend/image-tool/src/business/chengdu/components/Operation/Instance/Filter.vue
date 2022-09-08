<template>
    <div v-if="modelTree[0].children.length > 0">Class</div>
    <a-tree
        class="filter__tree"
        checkable
        :treeData="userTree"
        :defaultExpandAll="true"
        v-model:checkedKeys="userCheckedKeys"
        :selectable="false"
    >
    </a-tree>

    <template v-if="modelTree[0].children.length > 0">
        <div>Predicted Class</div>
        <a-tree
            class="filter__tree"
            checkable
            :treeData="modelTree"
            :defaultExpandAll="true"
            v-model:checkedKeys="modelCheckedKeys"
        >
        </a-tree>
    </template>
</template>
<script lang="ts" setup>
    import { ref, computed, inject } from 'vue';
    import { FilterEnum } from './type';

    const state: any = inject('state');

    const userCheckedKeys = ref<string[]>([FilterEnum.class]);
    const modelCheckedKeys = ref<string[]>([FilterEnum.predictedClass]);

    defineExpose({
        userCheckedKeys,
        modelCheckedKeys,
    });

    const userTree = computed(() => {
        // const state = this.state;
        const classList = state.list.filter((item: any) => !item.isModel);
        const noClassList = state.noClassList.data.filter((item: any) => !item.isModel);
        const objectN = classList.length + noClassList.length;

        const children = [];

        if (noClassList.length > 0) {
            const obj = {
                title: `Class Required(${noClassList.length})`,
                key: FilterEnum.noClass,
            };
            children.push(obj);
        }

        classList.forEach((item: any) => {
            const obj = {
                title: `${item.classType} (${item.data.length})`,
                key: item.classType,
            };
            children.push(obj);
        });

        const userTree = [
            {
                title: `Select All (${objectN})`,
                key: FilterEnum.class,
                children: [...children],
            },
        ];

        return userTree;
    });
    const modelTree = computed(() => {
        // const state = this.state;
        const classList = state.list.filter((item: any) => item.isModel);
        const noClassList = state.noClassList.data.filter((item: any) => item.isModel);
        const objectN = classList.length + noClassList.length;

        const children = [];

        if (noClassList.length > 0) {
            const obj = {
                title: `Class Required (${noClassList.length})`,
                key: FilterEnum.noClass,
            };
            children.push(obj);
        }

        classList.forEach((item: any) => {
            const obj = {
                title: `${item.classType} (${item.data.length})`,
                key: item.classType,
            };
            children.push(obj);
        });

        const modelTree = [
            {
                title: `Select All (${objectN})`,
                key: FilterEnum.predictedClass,
                children: [...children],
            },
        ];

        return modelTree;
    });
</script>
<style lang="less">
    .filter__tree {
        .ant-tree-switcher {
            display: none !important;
        }
    }
</style>
