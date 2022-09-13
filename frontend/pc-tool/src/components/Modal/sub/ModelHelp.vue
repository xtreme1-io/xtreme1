<template>
    <div class="model-help">
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
            </a-row>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { computed } from '@vue/reactivity';
    import { ref, ComputedRef } from 'vue';
    import { useInjectEditor } from '../../../state';
    import * as locale from '../lang';
    let editor = useInjectEditor();
    let $$ = editor.bindLocale(locale);
    type hotAction = {
        key: string[] | string;
        action: string;
    };
    const resultActions = computed<hotAction[]>(() => {
        return [
            {
                key: ['F'],
                action: $$('hk-create'),
            },
            {
                key: ['Del'],
                action: $$('hk-del'),
            },
            {
                key: ['Ctrl/⌘', '+', 'Z'],
                action: $$('hk-undo'),
            },
            {
                key: ['Ctrl/⌘', '+', 'Shift', '+', 'Z'],
                action: $$('hk-redo'),
            },
        ];
    });
    const editActions = computed<hotAction[]>(() => {
        return [
            {
                key: ['W', '/', 'S'],
                action: $$('hk-move-ws'),
            },
            {
                key: ['A', '/', 'D'],
                action: $$('hk-move-ad'),
            },
            {
                key: ['Q', '/', 'E'],
                action: $$('hk-move-qe'),
            },
            {
                key: ['Z', '/', 'X'],
                action: $$('hk-rotate'),
            },
            {
                key: ['T'],
                action: $$('hk-attribute'),
            },
            {
                key: ['M'],
                action: $$('hk-label'),
            },
            {
                key: ['C'],
                action: $$('hk-rotate-head'),
            },
        ];
    });
    const displayActions = computed<hotAction[]>(() => {
        return [
            {
                key: ['G'],
                action: $$('hk-axis'),
            },
            editor.state.imgViews.length > 0
                ? {
                      key: ['B'],
                      action: $$('hk-filter'),
                  }
                : null,
            {
                key: ['N'],
                action: $$('hk-measure'),
            },
        ].filter((e) => e) as hotAction[];
    });

    function isSign(key: string) {
        return key === '/' || key === '+' || key === '~';
    }
    const Actions: { title: string; action: ComputedRef<hotAction[]> }[] = [
        {
            title: 'Actions',
            action: resultActions,
        },
        {
            title: 'Edit Cuboid',
            action: editActions,
        },
        {
            title: 'Display',
            action: displayActions,
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
