<template>
    <div class="keyboard__container">
        <div class="table">
            <div class="body" v-for="item in shortcutsData" :key="item.key">
                <div class="title">
                    <span>{{ item.key }}</span>
                    <span>Hotkeys</span>
                </div>
                <div class="content">
                    <template v-if="item.value.length > 0">
                        <div
                            class="content__text"
                            v-for="child in item.value"
                            :key="child.textValue"
                        >
                            <div
                                :class="[
                                    child.wrap ? 'content__text--wrap' : 'content__text--nowrap',
                                ]"
                            >
                                <div class="content__text--first">
                                    <span>{{ child.textValue }}</span>
                                    <span v-if="child.textHelp">{{ child.textHelp }}</span>
                                </div>
                                <div class="content__text--last">
                                    <template v-for="(action, index) in child.actionValue">
                                        <span class="action__text">{{ action }}</span>
                                        <span
                                            class="action__plus"
                                            v-if="index < child.actionValue.length - 1"
                                        >
                                            +
                                        </span>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </template>
                    <div v-else>
                        <div class="content--text--no">0 matched</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { ref, computed, watch } from 'vue';
    // import { CloseOutlined } from '@ant-design/icons-vue';
    import {
        dataConfig,
        instanceConfig,
        toolConfig,
        imageConfig,
        elseConfig,
    } from '../../../../editor/config/keyboard';
    import { useInjectTool } from '../../state';
    let tool = useInjectTool();
    const editor = tool.editor;
    watch(
        () => editor.state.showKeyboard,
        () => {
            setTimeout(() => {
                emits('updateSearchValue', '');
            }, 300);
        },
    );

    // Search --
    const emits = defineEmits(['updateSearchValue']);
    const props = defineProps<{
        searchValue: string;
    }>();
    const filterValue = computed(() => {
        return props.searchValue;
    });

    // Shortcut key data
    const dataList = computed(() => {
        return dataConfig.filter((item) => {
            const lowerTextValue = item.textValue.toLowerCase();
            const lowerActionValue = item.actionValue.join().toLowerCase();
            const resultValue = lowerTextValue + lowerActionValue;
            const lowerFilterValue = filterValue.value.toLowerCase();
            if (resultValue.includes(lowerFilterValue)) {
                return true;
            } else {
                return false;
            }
        });
    });
    const instanceList = computed(() => {
        return instanceConfig.filter((item) => {
            const lowerTextValue = item.textValue.toLowerCase();
            const lowerActionValue = item.actionValue.join().toLowerCase();
            const resultValue = lowerTextValue + lowerActionValue;
            const lowerFilterValue = filterValue.value.toLowerCase();
            if (resultValue.includes(lowerFilterValue)) {
                return true;
            } else {
                return false;
            }
        });
    });
    const toolList = computed(() => {
        return toolConfig.filter((item) => {
            const lowerTextValue = item.textValue.toLowerCase();
            const lowerActionValue = item.actionValue.join().toLowerCase();
            const resultValue = lowerTextValue + lowerActionValue;
            const lowerFilterValue = filterValue.value.toLowerCase();
            if (resultValue.includes(lowerFilterValue)) {
                return true;
            } else {
                return false;
            }
        });
    });
    const imageList = computed(() => {
        return imageConfig.filter((item) => {
            const lowerTextValue = item.textValue.toLowerCase();
            const lowerActionValue = item.actionValue.join().toLowerCase();
            const resultValue = lowerTextValue + lowerActionValue;
            const lowerFilterValue = filterValue.value.toLowerCase();
            if (resultValue.includes(lowerFilterValue)) {
                return true;
            } else {
                return false;
            }
        });
    });
    const elseList = computed(() => {
        return elseConfig.filter((item) => {
            const lowerTextValue = item.textValue.toLowerCase();
            const lowerActionValue = item.actionValue.join().toLowerCase();
            const resultValue = lowerTextValue + lowerActionValue;
            const lowerFilterValue = filterValue.value.toLowerCase();
            if (resultValue.includes(lowerFilterValue)) {
                return true;
            } else {
                return false;
            }
        });
    });
    const shortcutsData = computed(() => {
        return [
            {
                key: 'Data',
                value: dataList.value,
            },
            {
                key: 'Instance',
                value: instanceList.value,
            },
            {
                key: 'Tool',
                value: toolList.value,
            },
            {
                key: 'Image',
                value: imageList.value,
            },
            {
                key: 'Else',
                value: elseList.value,
            },
        ];
    });
</script>
<style scoped lang="less">
    .keyboard__container {
        position: relative;
        height: 100%;
        overflow: hidden;
        background: #3a3a3e;
        .table {
            .body {
                margin: 5px 8px;
                margin-bottom: 15px;
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-size: 14px;
                line-height: 16px;
                color: #bec1ca;
                border: 1px solid #000000;
                border-radius: 4px;
                .title {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px;
                    background: #3e4047;
                    border-bottom: 1px solid #000000;
                    border-radius: 4px;
                }
                .content {
                    padding: 10px;
                    overflow: hidden;
                    &__text {
                        // Configure in config
                        // wrap
                        &--wrap {
                            display: grid;
                            grid-template-columns: repeat(auto-fill, minmax(50%, 100%));
                            align-items: center;
                        }
                        // no-pwrap
                        &--nowrap {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            align-items: center;
                            .content__text--last {
                                text-align: right;
                            }
                        }
                        &--first {
                            padding: 10px 0;
                            white-space: nowrap;
                            display: flex;
                            flex-direction: column;
                            text-align: left;
                            span {
                                display: inline;
                                &:nth-child(2) {
                                    color: #b3b9be;
                                }
                            }
                        }
                        &--last {
                            padding: 10px 0;
                            white-space: nowrap;
                            span {
                                font-size: 12px;
                                line-height: 14px;
                                &.action__text {
                                    color: #333333;
                                    border-radius: 3px;
                                    background: #d2dae0;
                                    padding: 6px 10px;
                                }
                                &.action__plus {
                                    background: unset;
                                    color: #d2dae0;
                                }
                            }
                        }
                    }
                    &--text--no {
                        text-align: center;
                        margin-top: 10px;
                    }
                }
            }
        }
    }
</style>
