<template>
    <div class="model-help">
        <!-- <div style="margin: 12px 0">
            <a-input
                style="width: 200px"
                v-model:value="searchInput"
                placeholder="Please enter a keyword"
            >
                <template #suffix>
                    <SearchOutlined style="color: rgba(255, 255, 255, 0.75)" />
                </template>
            </a-input>
            <span style="line-height: 32px; float: right"
                >Can't find?
                <a target="_blank" href="http://www.baidu.com">
                    Please enter the help center
                </a></span
            >
        </div> -->
        <div class="i-help-body">
            <a-row v-for="action in Actions" :gutter="8">
                <a-col :span="24" class="i-flex i-header"
                    ><div>{{ action.title }}</div
                    ><div class="i-title-line"></div
                ></a-col>
                <template v-if="action.action.value.length > 0">
                    <a-col :span="12" v-for="item in action.action.value" :key="item.key">
                        <a-row style="margin: 5px 0">
                            <a-col :span="10" class="i-flex">
                                <label
                                    v-for="_item in item.key"
                                    :class="[isSign(_item) ? 'i-label-add' : 'i-label']"
                                    >{{ _item }}</label
                                >
                            </a-col>
                            <a-col :span="13">{{ item.action }}</a-col>
                        </a-row>
                    </a-col>
                </template>
                <a-col v-else :span="24" style="text-align: center">No matching results</a-col>
            </a-row>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { SearchOutlined } from '@ant-design/icons-vue';
    import { computed } from '@vue/reactivity';
    import { ref, ComputedRef } from 'vue';
    type hotAction = {
        key: string[] | string;
        action: string;
    };
    const resultActions: hotAction[] = [
        {
            key: ['F'],
            action: 'Create Object',
        },
        {
            key: ['Del'],
            action: 'Delete Object',
        },
        {
            key: ['Ctrl/⌘', '+', 'Z'],
            action: 'Undo',
        },
        {
            key: ['Ctrl/⌘', '+', 'Shift', '+', 'Z'],
            action: 'Redo',
        },
    ];
    const editActions: hotAction[] = [
        {
            key: ['W', '/', 'S'],
            action: 'Move cuboid up/down',
        },
        {
            key: ['A', '/', 'D'],
            action: 'Move cuboid backward/forward',
        },
        {
            key: ['Q', '/', 'E'],
            action: 'Move cuboid left/right',
        },
        {
            key: ['Z', '/', 'X'],
            action: 'Rotate cuboid left/right',
        },
        {
            key: ['T'],
            action: 'Show/hide classes and attributes pad',
        },
        {
            key: ['M'],
            action: 'Show/Hide Label',
        },
        {
            key: ['C'],
            action: 'Rotate Head',
        },
    ];
    const displayActions: hotAction[] = [
        {
            key: ['G'],
            action: 'Show/hide Coordinate Axis',
        },
        {
            key: ['N'],
            action: 'Show/hide 2D results outside the selected object',
        },
        {
            key: ['B'],
            action: 'Show/hide Distance Measure',
        },
    ];
    const searchInput = ref('');
    function computeAction(hotkeyConfigs: hotAction[]) {
        return computed(() => {
            const reg = new RegExp(searchInput.value, 'i');
            return hotkeyConfigs.filter((item) => reg.test(item.action));
        });
    }
    function isSign(key: string) {
        return key === '/' || key === '+' || key === '~';
    }
    const Actions: { title: string; action: ComputedRef<hotAction[]> }[] = [
        {
            title: 'Actions',
            action: computeAction(resultActions),
        },
        {
            title: 'Edit Cuboid',
            action: computeAction(editActions),
        },
        {
            title: 'Display',
            action: computeAction(displayActions),
        },
    ];
</script>
<style lang="less">
    .model-help {
        padding: 0px 16px;

        .i-header {
            height: 30px;
            line-height: 30px;
        }

        .i-flex {
            display: flex;
            .i-title-line {
                flex: 1 1 0%;
                border-top: 1px solid #515151;
                height: 1px;
                align-self: center;
                margin: 0 40px 0 8px;
            }
        }
        .i-help-body {
            margin-left: -10px;
            margin-right: -10px;
            max-height: 70vh;
            overflow-y: auto;
            overflow-x: hidden;

            .i-label {
                margin: 0 3px;
                background-color: #ffffff;
                border-radius: 3px;
                padding: 0px 5px;
                color: #1f1f1f;
                font-size: 14px;
                align-self: center;
                line-height: 24px;
            }
            .i-label-add {
                align-self: center;
            }
        }
    }
</style>
