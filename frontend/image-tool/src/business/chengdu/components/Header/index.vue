<template>
    <div class="pc-flow">
        <div class="flow-left">
            <div class="flow-close" @click="onClose">
                <CloseOutlined class="close-icon" />
                <span class="close-text">Close</span>
            </div>
            <div class="flow-datainfo">
                <a-tooltip placement="bottom">
                    <template #title> {{ editor.state.dataName }} </template>
                    <span class="data-name">{{ editor.state.dataName }}</span>
                </a-tooltip>
                <div>
                    <div class="header-divider"></div>
                    <i style="font-size: 14px" class="iconfont icon-Job-information"></i>
                </div>
            </div>
        </div>
        <div class="flow-center">
            <a-tooltip placement="bottom" trigger="hover">
                <template #title> Page Up </template>
                <LeftOutlined
                    :class="state.dataIndex > 0 && !blocking ? 'icon' : 'icon disable'"
                    @click="state.dataIndex > 0 && !blocking ? onPre() : null"
                />
            </a-tooltip>
            <span class="text">
                <span class="current">{{ state.dataIndex + 1 }}</span>
                <span style="margin-right: 4px"> /</span>
                <span>{{ state.dataList.length }}</span>
            </span>
            <a-tooltip placement="bottom" trigger="hover">
                <template #title> Page Down </template>
                <RightOutlined
                    :class="
                        state.dataIndex < state.dataList.length - 1 && !blocking
                            ? 'icon'
                            : 'icon disable'
                    "
                    @click="
                        state.dataIndex < state.dataList.length - 1 && !blocking ? onNext() : null
                    "
                />
            </a-tooltip>
        </div>
        <div class="flow-right">
            <div class="flow-item" @click="onSave" v-if="has(BsUIType.flowSave)">
                <a-tooltip placement="bottom" trigger="hover">
                    <template #title> {{ storageTitle }} </template>
                    <div>
                        <LoadingOutlined
                            v-if="state.saving"
                            style="
                                font-size: 23px;
                                margin-bottom: 10px;
                                position: relative;
                                top: 5px;
                            "
                        ></LoadingOutlined>
                        <i
                            v-else
                            style="font-size: 14px"
                            class="iconfont icon-save"
                            :title="storageTitle"
                        ></i>
                    </div>
                </a-tooltip>
                <span class="icon-text">Save</span>
            </div>
            <div class="flow-item" @click="toggleKeyboard">
                <i style="font-size: 14px" class="iconfont icon-keyboard"></i>
                <!-- <img src="../../../../assets/keyboard.svg" /> -->
                <span class="icon-text" style="user-select: none">Hotkeys</span>
            </div>
            <div class="flow-item" @click="toggle">
                <a-tooltip placement="bottom">
                    <template #title>
                        <span style="white-space: nowrap">
                            {{ isFullscreen ? 'Exit Fullscreen' : 'Enter FullScreen' }}
                        </span>
                    </template>
                    <i
                        style="font-size: 14px"
                        class="iconfont"
                        :class="{
                            'icon-enter-fullscreen': !isFullscreen,
                            'icon-exit-fullscreen': isFullscreen,
                        }"
                    ></i>
                </a-tooltip>
                <span class="icon-text">{{
                    !isFullscreen ? 'Fullscreen' : 'Exit Fullscreen'
                }}</span>
            </div>
            <div class="flow-item">
                <div class="header-divider"></div>
            </div>
            <div class="flow-btn">
                <template v-if="!isViewMode">
                    <a-button
                        v-if="showInvalid"
                        type="primary"
                        style="background: #fcb17a"
                        @click="handleMark(ValidStatus.INVALID)"
                        :loading="markLoading"
                    >
                        Mark as Invaild
                    </a-button>
                    <a-button
                        v-else
                        type="primary"
                        style="background: #91e0a2"
                        @click="handleMark(ValidStatus.VALID)"
                        :loading="markLoading"
                    >
                        Mark as vaild
                    </a-button>
                    <a-button type="primary" style="background: #98b0d2" @click="handleSkip">
                        Skip
                    </a-button>
                    <a-button
                        type="primary"
                        class="submit-btn"
                        @click="handleSubmit"
                        :loading="submitLoading"
                    >
                        <template #icon>
                            <i
                                style="font-size: 14px"
                                class="iconfont icon-keyboard submit-icon"
                            ></i>
                        </template>
                        {{ submitBtnText }}
                    </a-button>
                </template>
                <a-button
                    v-else
                    type="primary"
                    style="background: #fcb17a"
                    @click="handleModify"
                    :loading="modifyLoading"
                >
                    Modify
                </a-button>
            </div>
        </div>
    </div>
    <a-drawer
        placement="right"
        :width="268"
        :keyboard="false"
        :maskClosable="false"
        @close="toggleKeyboard"
        v-model:visible="showKeyboard"
        :headerStyle="{ position: 'sticky', top: 0 }"
    >
        <template #title>
            <div class="header-title">Hotkeys</div>
            <div class="header-search">
                <a-input-search
                    v-model:value="searchValue"
                    placeholder="Input keyword"
                    @search="handleSearch"
                />
            </div>
        </template>
        <TheKeyboard :searchValue="searchValue" @updateSearchValue="handleUpdateSearch" />
    </a-drawer>
</template>

<script setup lang="ts">
    import { reactive, ref, computed, onMounted, createVNode } from 'vue';
    import { useFullscreen } from '@vueuse/core';
    import {
        SaveOutlined,
        LeftOutlined,
        RightOutlined,
        CloseOutlined,
        SnippetsOutlined,
        LoadingOutlined,
    } from '@ant-design/icons-vue';
    import { useInjectTool } from '../../state';
    import TheKeyboard from './TheKeyboard.vue';
    import { isMac } from '../../utils';
    import { ValidStatus, AnnotateStatus } from '../../../../editor/type';

    import useHeader from './useHeader';
    import useFlow from '../../hook/useFlow';
    import useUI from '../../hook/useUI';
    import { BsUIType } from '../../config/ui';

    const { isFullscreen, toggle } = useFullscreen();
    let { init } = useFlow();
    let { has } = useUI();
    let tool = useInjectTool();
    let state = tool.state;
    const editor = tool.editor;
    const showKeyboard = computed(() => {
        return editor.state.showKeyboard;
    });

    let {
        blocking,
        dataIndex,
        onSave,
        onPre,
        onNext,
        onClose,
        toggleKeyboard,
        onMark,
        onSubmit,
        onSkip,
        onModify,
    } = useHeader();

    onMounted(() => {
        init();
    });

    // Search --
    const searchValue = ref<string>('');
    const handleSearch = () => {
        console.log('search ', searchValue);
    };
    const handleUpdateSearch = () => {
        searchValue.value = '';
    };

    // Title -----------------------
    const storageTitle = isMac() ? 'Save（⌘ + S）' : 'Save（Ctrl + S）';

    // Button Methods -------
    const isViewMode = computed<boolean>(() => {
        return editor.state.mode == 'view';
    });

    const markLoading = ref<boolean>(false);
    const handleMark = async (value: ValidStatus) => {
        markLoading.value = true;
        const res = await onMark(value);
        markLoading.value = false;
        if (res) {
            // showInvalid.value = res == 'valid';
            editor.state.validStatus = res;
        }
    };
    const showInvalid = computed<boolean>(() => {
        return editor.state.validStatus == ValidStatus.VALID;
    });

    const handleSkip = () => {
        onSkip();
    };

    const submitLoading = ref<boolean>(false);
    const handleSubmit = async () => {
        submitLoading.value = true;
        await onSubmit();
        submitLoading.value = false;
    };
    const submitBtnText = computed<string>(() => {
        console.log('submitBtnText ', editor.state);
        if (editor.state.annotationStatus == AnnotateStatus.ANNOTATED) {
            return 'Update';
        } else {
            return 'Submit';
        }
    });

    const modifyLoading = ref<boolean>(false);
    const handleModify = async () => {
        modifyLoading.value = true;
        await onModify();
        modifyLoading.value = false;
    };
</script>

<style lang="less">
    .header-divider {
        width: 1px;
        height: 100%;
        background-color: #57575c;
        margin: 0 16px;
    }
    .pc-flow {
        font-family: 'Roboto';
        font-style: normal;
        font-weight: 400;
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .flow-left {
            margin-left: 16px;
            display: flex;
            align-items: center;

            .flow-close {
                position: relative;
                display: flex;
                // flex-direction: column;
                justify-content: space-between;
                align-items: center;
                font-size: 20px;
                padding: 5px;
                .close-icon {
                    margin-right: 12px;
                    font-size: 14px;
                }
                .close-text {
                    font-size: 16px;
                }
            }
            .flow-datainfo {
                height: 32px;
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                margin-left: 20px;
                padding: 8px 15px;
                border-radius: 300px;
                background: #3a3a3e;
                .data-name {
                    max-width: 300px;
                    font-size: 14px;
                    // line-height: 16px;
                    color: #dee5eb;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                }
            }
        }
        .flow-center {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            .icon {
                font-size: 12px;
                color: #fff;
                &.disable {
                    cursor: not-allowed;
                    color: #5a5a5a;
                }
            }
            .text {
                font-size: 14px;
                padding: 0 8px;
                .current {
                    padding: 4px 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }
            }
        }
        .flow-right {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 15px;
            height: 32px;
            margin-right: 16px;

            .flow-item {
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                cursor: pointer;
                &:hover {
                    color: #57ccef;
                }
                &.icon {
                    margin-left: 8px;
                    margin-right: 5px;
                }

                .icon-text {
                    font-size: 12px;
                    margin-top: 5px;
                    color: #bec1ca;
                }
            }
            .flow-btn {
                display: flex;
                gap: 10px;
                button {
                    display: flex;
                    align-items: center;
                    padding: 6px 15px;
                    border-radius: 30px;
                    border: unset;
                    text-shadow: none;
                }
                .submit-btn {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    padding: 0px 10px 0px 0px;
                    gap: 6px;
                    background: rgba(96, 169, 254, 0.6);
                    border: 1px solid #60a9fe;
                    box-shadow: inset 0px 0px 4px 1px #57ccef;
                    border-radius: 30px;
                    .submit-icon {
                        width: 32px;
                        height: 32px;
                        line-height: 32px;
                        border-radius: 50%;
                        transform: translateX(-1px);
                        background: #60a9fe;
                    }
                }
            }
        }
    }
    // .shortcutsClass {
    //     position: absolute;
    //     top: 50px;
    //     right: 5px;
    //     z-index: 99;
    //     width: 350px;
    //     height: 80vh;
    //     overflow: overlay;
    //     background-color: #040410;
    //     // border-radius: 10px;
    // }
    .ant-drawer {
        top: 54px;
        height: calc(100% - 54px);
        .ant-drawer-content {
            background: #3a3a3e;
            box-shadow: inset 1px 0px 0px #000000;
            .ant-drawer-header {
                background: #3a3a3e;
                border: none;
                z-index: 999;
                padding: 10px 8px;
                .header-title {
                    margin-bottom: 20px;
                }
                .header-search {
                    padding-right: 5px;
                    .ant-input-search {
                        border: 1px solid #cccccc;
                        border-radius: 4px;
                        color: #bec1ca;
                    }
                }
                .ant-drawer-close {
                    right: 8px;
                    font-size: 14px;
                    width: 20px;
                    height: 20px;
                }
            }
            .ant-drawer-body {
                padding: 0;
            }
        }
    }
</style>
