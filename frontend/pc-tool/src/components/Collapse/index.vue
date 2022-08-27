<template>
    <a-collapse class="operation-collapse" v-model:activeKey="state.activeTabs" :bordered="false">
        <a-collapse-panel :showArrow="false" key="item-1">
            <template #header>
                <div>
                    <slot name="header" v-if="$slots.header"></slot>
                    <span v-else class="collapse-title">{{ header || '' }}</span>
                </div>
            </template>
            <slot></slot>
        </a-collapse-panel>
    </a-collapse>
</template>

<script setup lang="ts">
    import { reactive, watch } from 'vue';

    interface IProps {
        header?: string;
        open?: boolean;
    }
    // ***************Props and Emits***************
    // let emit = defineEmits(['update:value', 'change']);
    let props = withDefaults(defineProps<IProps>(), {
        open: true,
    });
    // *********************************************
    let state = reactive({
        activeTabs: props.open ? ['item-1'] : [],
    });

    // watch(
    //     () => props.open,
    //     () => {
    //         state.activeTabs = props.open ? ['item-1'] : [];
    //     },
    // );
</script>

<style lang="less">
    .operation-collapse {
        // .header {
        //     height: 24px;
        //     line-height: 24px;

        // }
        .ant-collapse-header {
            .tool {
                float: right;
                padding-right: 4px;
                .icon {
                    font-size: 14px;
                    margin-left: 2px;
                    padding: 4px;

                    &.active {
                        background: #3c9be8;
                        color: white;
                        border-radius: 4px;
                    }
                }
            }
        }

        .content {
            height: 300px;
            border: 1px solid;
        }
    }
</style>
