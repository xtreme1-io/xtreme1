<template>
    <div class="i-line-height">
        <div
            @click.stop="onCurTrackClick"
            @contextmenu.prevent.stop="onContextMenu"
            style="display: inline-block; height: 100%"
        >
            <div
                v-for="(item, index) in trackList"
                :key="index"
                :class="{
                    'i-tool-frame': true,
                }"
                :style="{ width: spanWidth + 'px' }"
            >
                <span
                    :class="['i-tool-span', _status_color(item)]"
                    :style="_style_track(item, index)"
                >
                    <template v-if="showStatus">
                        <!-- <div class="status-context miss" v-if="isMiss(item)"></div> -->
                        <!-- <div class="status-context invalid" v-if="invalid(item, index)"></div> -->
                        <div
                            class="status-context frame-invalid"
                            v-if="frameDataInvalid(index)"
                        ></div>
                        <div class="icon-context">
                            <i
                                v-if="marked(index)"
                                style="display: inline-block"
                                class="comment iconfont icon-pizhu"
                            ></i>
                        </div>
                    </template>
                </span>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { IUserData, utils } from 'pc-editor';
    import { CSSProperties, reactive } from 'vue';
    import { useInjectEditor } from '../../state';
    // import { IValidity } from 'pc-editor';

    import { IMsgOption } from './useTimeLine';
    const { empty } = utils;
    const editor = useInjectEditor();

    const colorConfig = {
        activeColor: '#fcecc4',
        trustColor: '#2ecc71',
        modelColor: '#ffffff', // '#90d96c',
        emptyColor: '#303036', //'#c5c8cd',
        errorColor: '#ff3653',
        defaultColor: '#4f556c',
        noclassColor: 'grey',
    };

    const props = defineProps<{
        trackList: IUserData[];
        annotates?: boolean[];
        colorMap: {};
        spanWidth: number;
        msgEvent?: boolean;
        click?: boolean;
        showStatus?: boolean;
        primary?: boolean;
        msgTip?: (option: IMsgOption) => void;
        errIndex?: number[];
        activeType?: {
            classType: any;
            modelClass: any;
        };
    }>();
    enum IMsgStatus {
        MSG,
        Menu,
    }
    const iState = reactive({
        msgStatus: IMsgStatus.MSG,
        msgVisible: false,
        menuIndex: -1,
    });
    const isError = (index: number) => {
        return (props.errIndex || []).indexOf(index) !== -1;
    };
    // const isTrueValue = (item?: IUserData) => {
    //     return item?.trueValue;
    // };
    // const isNoTrueValue = (item?: IUserData) => {
    //     return item?.resultStatus && !isTrueValue(item);
    // };
    //   const getColor = (userData?: IUserData) => {
    //     const colorMap = props.colorMap;

    //     if (userData?.classType) {
    //       return colorConfig.defaultColor;
    //       // switch (userData.resultStatus) {
    //       //     case Const.True_Value:
    //       //         return colorMap[userData.classType] || colorConfig.emptyColor;
    //       //     default:
    //       //     case Const.Predicted:
    //       //     case Const.Copied:
    //       //         return colorMap['false_' + userData.classType] || colorConfig.emptyColor;
    //       // }
    //     } else if (userData?.modelClass) {
    //       return colorConfig.modelColor;
    //     } else if (userData) {
    //       return colorConfig.noclassColor; //colorConfig.emptyColor;
    //     } else {
    //       return colorConfig.emptyColor;
    //     }
    //   };

    const _status_color = (userData: IUserData) => {
        if (userData?.classType) {
            return props.primary ? 'primary-color' : 'default-color';
        } else if (userData) {
            return 'no-class-color';
        } else {
            return 'empty-color';
        }
    };
    const _style_track = (userData: IUserData, index: number) => {
        const style: CSSProperties = {};
        const classColor = props.colorMap[userData?.classId ?? ''];
        if (isError(index)) {
            style.backgroundColor = colorConfig.errorColor;
        } else if (classColor) {
            style.backgroundColor = classColor;
        }
        // if (index === iState.menuIndex || (iState.menuIndex < 0 && isActive(userData))) {
        //     style.top = '4px';
        //     style.bottom = '1px';
        // }
        return style;
    };

    function isActive(userData: IUserData) {
        if (empty(userData) || empty(props.activeType)) return;
        if (!empty(props.activeType?.classType)) {
            return userData.classType === props.activeType?.classType;
        } else {
            return (
                empty(userData.classType) && userData.modelClass === props.activeType?.modelClass
            );
        }
    }
    function getFrameIndexByEvent(event: MouseEvent): number {
        const frameIndex = Math.ceil((event.offsetX + 0.001) / props.spanWidth);
        return frameIndex;
    }
    // function onHandleEvent(event: MouseEvent, visible: boolean) {
    //     if (!props.msgTip) {
    //         return;
    //     }
    //     if (iState.msgStatus === IMsgStatus.Menu) return;
    //     const frameIndex = getFrameIndexByEvent(event);
    //     const userData: IUserData = props.trackList[frameIndex - 1];
    //     let msgVisible = false;
    //     const msg: any[] = [];
    //     if (visible) {
    //         if (invalid(userData, frameIndex - 1)) {
    //             msg.push({ msg: editor.lang('invalid'), class: 'invalid' });
    //             msgVisible = true;
    //         }
    //         if (userData && userData.invisibleFlag) {
    //             msg.push({
    //                 msg: editor.lang('invisible'),
    //                 class: 'invisible',
    //             });
    //             msgVisible = true;
    //         }
    //         if (marked(frameIndex - 1)) {
    //             msg.push({ msg: editor.lang('mark'), class: 'primary-font' });
    //             msgVisible = true;
    //         }
    //         iState.menuIndex = frameIndex - 1;
    //     } else {
    //         iState.menuIndex = -1;
    //     }
    //     showMsg(event, msgVisible, msg);
    // }
    // function showMsg(event: MouseEvent, visible: boolean, msg: { msg: string; class: string }[]) {
    //     if (!props.msgTip) return;
    //     const { offsetY, clientX, clientY } = event;
    //     const { innerHeight } = window;

    //     props.msgTip({
    //         target: {
    //             x: clientX,
    //             y: innerHeight - clientY + offsetY,
    //         },
    //         data: {
    //             msg: msg,
    //         },
    //         visible: visible,
    //     });
    // }
    // function isMiss(item: IUserData) {
    //     return item?.invisibleFlag === true;
    // }
    // function invalid(item: IUserData, index: number) {
    //     if (editor.currentTrack) {
    //         return !!item?.invalid;
    //     } else {
    //         const isAnn = editor.state.toolType === ToolType.ANNOTATE;
    //         return isAnn ? editor.state.frames[index]?.invalid : false;
    //     }
    // }
    const frameDataInvalid = (index: number) => {
        const frame = editor.state.frames[index] || {};
        return frame.dataStatus === 'INVALID';
    };
    function marked(index: number) {
        return props.annotates && props.annotates[index];
    }
    function onCurTrackClick(event: MouseEvent) {
        if (props.click !== true) return;
        const beforeIndex = editor.state.frameIndex;
        let index = getFrameIndexByEvent(event);
        // emit('frameIndexChange', frameIndex);
        const total = editor.state.frames.length;
        if (index > total) {
            index = total;
        }
        editor.loadFrame(index - 1);
    }
    //   async function showMenu(event: MouseEvent, visible: boolean, data: any) {
    //     const { offsetX, offsetY, clientX, clientY, pageY } = event;
    //     const { innerHeight, innerWidth } = window;
    //     // return editor
    //     //     .showMenu('Menu', {
    //     //         target: {
    //     //             x: clientX,
    //     //             y: innerHeight - clientY + offsetY,
    //     //         },
    //     //         data,
    //     //         visible,
    //     //     })
    //     //     .catch(() => {
    //     //         reset();
    //     //     });
    //   }
    //   function reset() {
    //     iState.msgStatus = IMsgStatus.MSG;
    //     iState.menuIndex = -1;
    //     iState.msgVisible = false;
    //     if (props.activeType) {
    //       Object.assign(props.activeType, {
    //         classType: '',
    //         modelClass: '',
    //       });
    //     }
    //   }

    function onContextMenu(event: MouseEvent) {
        const frameIndex = getFrameIndexByEvent(event);
        const userData: IUserData = props.trackList[frameIndex - 1];
        if (props.msgEvent === false || !userData) {
            return;
        }
        iState.msgStatus = IMsgStatus.Menu;
        iState.menuIndex = frameIndex - 1;
        // showMenu(event, visible, {
        //     invisible: !!userData.invisibleFlag,
        // }).then((data) => {
        //     emit('setInvisibleFlag', frameIndex - 1, data.checked);
        //     reset();
        // });
    }
</script>
<style lang="less">
    .i-line-height {
        .i-tool-frame {
            display: inline-block;
            position: relative;
            height: 100%;
            pointer-events: none;
            border-right: 1px solid #1e1f22;
            transform: translateZ(0);

            &.truth-value::after {
                position: absolute;
                right: 0;
                bottom: 1px;
                left: 0;
                border: 2px solid #72c240;
                z-index: 7;
                height: 1px;
                content: '';
                // bottom: -3px;
            }

            &.no-truth-value::after {
                position: absolute;
                inset: 6px 1px 2px;
                z-index: 5;
                background: linear-gradient(to right, transparent 50%, #727272 50%);
                background-size: 4px 100%;
                content: '';
                // background: repeating-linear-gradient(90deg, transparent, transparent, gray, gray, transparent, transparent 4px);
            }

            .i-tool-span {
                position: absolute;
                inset: 5px 0 1px;
                // top: 14px;
                overflow: hidden;
                font-size: 14px;
                text-align: center;
                color: rgb(255 169 0);

                &.default-color {
                    background-color: #4f556c;
                }

                &.model-color {
                    background-color: #ffffff;
                }

                &.no-class-color {
                    background-color: grey;
                }

                &.empty-color {
                    background-color: #303036;
                }

                &.primary-color {
                    background-color: #2e8cf0;
                }

                &.invalid {
                    border: 1px solid #f8827b;
                }

                // padding-top: 40%;
                &.active {
                    // box-shadow: 0 0 1px 1px #666666;
                    // z-index: 5;
                }

                .status-context {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;

                    &.frame-invalid {
                        border: 1px solid red;
                        z-index: 6;
                        background-size: 100% 100%;
                        background-image: url('/x.png');
                    }

                    &.miss {
                        border: 2px dashed white;
                    }

                    &.invalid {
                        border: 1px solid #f8827b;
                    }
                }

                .icon-context {
                    display: inline-block;
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 7;
                    width: 100%;
                    height: 100%;
                    line-height: 26px;
                }
            }
        }
    }
</style>
