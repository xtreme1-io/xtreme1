<template>
  <div
    :class="`${prefixCls}`"
    @mouseenter="handleOver"
    @mouseleave="handleLeave"
    :style="info?.type !== datasetTypeEnum.LIDAR_FUSION ? 'margin-bottom: 20px' : ''"
  >
    <div class="lockInfo">
      <div v-if="data?.splitType && data.splitType !== 'NOT_SPLIT'" class="splitType"
        ><span :style="getSplitColor(data.splitType)"
          >{{ translateSplit(data.splitType) }}
        </span></div
      >
      <div v-if="data.lockedBy"> <Icon icon="bx:bxs-lock" /> Editing by {{ data.lockedBy }} </div>
    </div>
    <div class="img">
      <div :class="getCheckboxClass" v-if="!data.lockedBy">
        <Checkbox :checked="isSelected" @change="handleSelectedChange" />
      </div>
      <div :class="getMaskClass" v-if="!data.lockedBy" @click="handleCheck">
        <div class="frameWrapper" v-if="isFrame()">
          <div class="openBtn">
            <Button
              type="primary"
              block
              border
              @click="
                (e) => {
                  e.stopPropagation();
                  handleView(data.id, isFrame());
                }
              "
            >
              View
            </Button>
          </div>
          <div class="openBtn" v-if="isFrame()">
            <Button
              type="primary"
              block
              border
              @click="
                (e) => {
                  e.stopPropagation();
                  emits('handleAnotateFrame', data.id);
                }
              "
            >
              Annotate
            </Button>
          </div>
          <div class="openBtn">
            <Button
              type="danger"
              block
              border
              @click="
                (e) => {
                  e.stopPropagation();
                  handleDel(e);
                }
              "
            >
              Delete
            </Button>
          </div>
        </div>
        <div class="wrapper" v-else>
          <div class="wrapper-line">
            <div class="openBtn" v-if="type !== PageTypeEnum.frame">
              <Button
                type="primary"
                block
                border
                @click="
                  (e) => {
                    e.stopPropagation();
                    handleView(data.id, isFrame());
                  }
                "
              >
                View
              </Button>
            </div>
            <div class="openBtn">
              <Button
                type="danger"
                block
                border
                @click="
                  (e) => {
                    e.stopPropagation();
                    handleDel(e);
                  }
                "
              >
                Delete
              </Button>
            </div>
          </div>
          <div class="wrapper-line">
            <div class="openBtn" v-if="type !== PageTypeEnum.frame">
              <Button
                type="primary"
                block
                border
                @click="
                  (e) => {
                    e.stopPropagation();
                    handleAnnotate(data.id);
                  }
                "
              >
                Annotate
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div class="floder-img" v-if="isFrame()">
        <img :src="floder" alt="" />
        <div class="title"> {{ data.name }} </div>
      </div>
      <div
        v-else-if="info?.type === datasetTypeEnum.TEXT"
        class="relation-container image-loading"
        style="width: 100%; height: 100%"
      >
        <!-- {{ convaersationData }} -->
        <div class="text-box">
          <template v-for="item in convaersationData" :key="item.id">
            <div class="question" v-if="item.role === 'prompter'">
              <div class="head">P</div>
              <div class="conversation">{{ item.text }}</div>
            </div>
            <div class="answer" v-else>
              <div class="conversation">{{ item.text }}</div>
              <div class="head">A</div>
            </div>
          </template>
        </div>
        <div class="p-2 name bottom"> {{ data.name }} </div>
      </div>
      <template v-else-if="info?.type === datasetTypeEnum.LIDAR_FUSION">
        <div class="place relation-container image-loading">
          <img class="pointCloudImg h-83px" v-lazyload="getPlaceImg()" alt="" />
          <NodePc :pcObject="iState.pcObject" ref="svg" />
          <!-- <svg ref="svg" class="easy-pc" fill="transparent" stroke-width="1" stroke="currentColor">
            <polygon v-for="item in iState.pcObject" :key="item.id" :points="item.points" />
          </svg> -->
        </div>
        <div class="camera">
          <div
            class="img-item image-loading"
            v-for="(item, index) in [0, 1, 2]"
            :ref="(e) => setRef(e, index)"
            :key="item"
          >
            <img :key="item" v-lazyload="getPcImage(iState.pcImageObject[item])" alt="" />
            <NodePcImage :pcImageObject="iState.pcImageObject[item]?.object" />
            <!-- <svg class="easy-image" stroke-width="1" stroke="currentColor" fill="transparent">
              <template v-for="_item in iState.pcImageObject[item]?.object || []">
                <polygon v-if="_item.type === '2D_RECT'" :key="_item.id" :points="_item.points" />
                <polyline
                  v-else-if="_item.type === '2D_BOX'"
                  :key="_item.uuid"
                  :points="_item.points"
                />
              </template>
            </svg> -->
          </div>
        </div>
        <div class="name"> {{ data.name }} </div>
      </template>
      <div
        class="place relation-container"
        v-else-if="info?.type === datasetTypeEnum.LIDAR_BASIC"
        style="width: 100%; height: 100%"
      >
        <img class="object-cover pointCloudImg image-loading" v-lazyload="getPlaceImg()" alt="" />
        <NodePc :pcObject="iState.pcObject" ref="svg" />
        <!-- <svg ref="svg" class="easy-pc" fill="transparent" stroke-width="1" stroke="currentColor">
          <polygon v-for="item in iState.pcObject" :key="item.id" :points="item.points" />
        </svg> -->
        <div class="p-2 name bottom"> {{ data.name }} </div>
      </div>
      <div
        v-else-if="info?.type === datasetTypeEnum.IMAGE"
        class="relation-container image-loading"
        style="width: 100%; height: 100%"
      >
        <img
          class="place image-card"
          ref="svg"
          :viewBox="`0 0 ${size.svgWidth} ${size.svgHeight}`"
          @load="() => onImgLoad(data)"
          v-lazyload="getImageUrl(data) || placeImg"
          alt=""
        />
        <NodeImage
          :viewBox="{ width: size.svgWidth, height: size.svgHeight }"
          :imageObject="iState.imageObject"
        />
        <!-- <svg
          class="easy-image"
          :style="{
            width: size.svgWidth + 'px',
            height: size.svgHeight + 'px',
          }"
          v-if="size.init"
          stroke-width="1"
          stroke="white"
          fill="transparent"
        >
          <template v-for="item in iState.imageObject">
            <polyline
              v-if="item.type === 'POLYLINE'"
              :stroke="item.color"
              :key="item.uuid"
              :points="item.points"
            />
            <template v-else-if="item.hole.length > 0">
              <mask :id="item.uuid" :key="item.uuid">
                <polygon :points="item.points" fill="currentColor" />
                <polygon
                  v-for="(_item, _idx) in item.hole"
                  fill="#000"
                  :key="_idx"
                  :points="_item"
                />
              </mask>

              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                :fill="item.color || '#fff'"
                :key="item.uuid"
                :style="{ mask: `url(#${item.uuid})` }"
              />
            </template>
            <polygon
              v-else
              :key="item.type + item.uuid"
              :stroke="item.color"
              :points="item.points"
            />
          </template>
        </svg> -->
        <div class="p-2 name bottom"> {{ data.name }} </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref, unref, defineProps, defineEmits, onBeforeMount } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { Checkbox } from 'ant-design-vue';
  import Button from '/@@/Button/index.vue';
  import floder from '/@/assets/images/dataset/frameSeriesImg.png';
  import { Modal } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { DatasetItem, DatasetListItem } from '/@/api/business/model/datasetModel';
  import placeImg from '/@/assets/images/dataset/fusion-banner-content.png';
  // import placeImgFull from '/@/assets/images/dataset/basic-banner-content.png';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import { dataTypeEnum } from '/@/api/business/model/datasetModel';
  import { PageTypeEnum } from './data';
  import { useImgCard, NodeImage, NodePcImage, NodePc } from './useCardObject';
  import { Icon } from '/@/components/Icon';
  import { goToTool } from '/@/utils/business';
  import { useRoute } from 'vue-router';
  const { query } = useRoute();
  const { id } = query;
  type Props = {
    data: DatasetItem;
    isSelected: boolean;
    info: DatasetListItem | undefined;
    type: PageTypeEnum | undefined;
    showAnnotation: boolean;
    object?: any[];
    selectedSourceIds?: any;
  };
  const emits = defineEmits([
    'handleSelected',
    'handleDelete',
    'handleSingleAnnotate',
    'handleAnotateFrame',
  ]);
  const translateSplit = (type) => {
    let LowerCase = type.toLowerCase();
    return type.slice(0, 1) + LowerCase.slice(1, LowerCase.length);
  };
  const props = defineProps<Props>();
  const {
    iState,
    size,
    svg,
    getPcImage,
    getPlaceImg,
    setRef,
    onImgLoad,
    getImageUrl,
    getTextJson,
  } = useImgCard(props);
  const dataId = unref(props).data.id;
  // const originalUrl = unref(props).data.files ? unref(props).data.files[0].url.originalUrl : null;
  const { prefixCls } = useDesign('img-card');
  // const go = useGo();
  const hover = ref<boolean>(false);
  const checked = ref<boolean>(false);
  const { t } = useI18n();
  const convaersationData: any = ref({});

  onBeforeMount(async () => {
    convaersationData.value = await getTextJson();
    console.log(convaersationData.value);
  });

  const getMaskClass = computed(() => {
    return unref(hover) ? 'mask animate-fadeIn animate-animated' : 'mask hidden';
  });
  const getCheckboxClass = computed(() => {
    return unref(hover) || unref(props.isSelected) ? 'checkbox' : 'checkbox hidden';
  });
  const handleOver = () => {
    handleTrigger(true);
  };

  // const onHandleImgLoad = (event: Event, data?: any) => {
  //   const target = event.target as HTMLImageElement;
  //   target?.parentElement?.classList.remove('image-loading');
  //   if (data) {
  //     onImgLoad(data);
  //   }
  // };

  const handleLeave = () => {
    handleTrigger(false);
  };

  const handleCheck = () => {
    if (!props.data.lockedBy) {
      checked.value = !unref(checked);
      emits('handleSelected', unref(checked), dataId);
    }
  };

  // const getPlaceImg = () => {
  //   const placeImgType = props.info?.type === datasetTypeEnum.LIDAR_BASIC ? placeImgFull : placeImg;
  //   const pc = props.data.content.filter((item) => item.name === 'pointCloud')[0];
  //   return pc && pc.files ? pc.files[0].file?.renderImage?.url || placeImgType : placeImgType;
  // };

  const handleTrigger = (flag: boolean) => {
    hover.value = flag;
  };

  const handleSelectedChange = (e) => {
    emits('handleSelected', e.target.checked, dataId);
  };

  const isFrame = () => {
    return props.data.type && props.data?.type === dataTypeEnum.FRAME_SERIES;
  };

  const getSplitColor = (type) => {
    let color = type === 'TRAINING' ? '#32D583' : type === 'TEST' ? '#FDB022' : '#3E8BE9';
    return `background:${color}`;
  };

  const handleAnnotate = (id) => {
    emits('handleSingleAnnotate', id);
  };

  const handleDel = (e) => {
    e.stopPropagation();
    Modal.confirm({
      title: () => 'Delete Data',
      content: () =>
        'Are you sure to delete the selected items or series?This action is irreversible',
      okText: t('common.delText'),
      okButtonProps: {
        danger: true,
      },
      onOk() {
        return new Promise((resolve) => {
          emits('handleDelete', props.data.id, () => {
            resolve(1);
          });
        }).catch(() => console.log('Oops errors!'));
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onCancel() {},
    });
  };

  const handleView = (dataId, isFrame) => {
    let params: any = {
      datasetId: id,
      dataId,
      type: 'readOnly',
    };
    if (isFrame) {
      params.dataType = 'frame';
    }
    goToTool(params, props.info?.type);
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-img-card';

  .@{prefix-cls} {
    position: relative;
    transform: translateZ(0);

    .lockInfo {
      position: absolute;
      padding: 0 10px;
      width: 100%;
      text-align: right;
      top: 6px;
      color: white;
      z-index: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      .splitType {
        span {
          display: inline-block;
          height: 20px;
          width: 85px;
          line-height: 20px;
          text-align: center;
          font-size: 12px;
          background: #fdb022;
          border-radius: 15px;
        }
      }
    }

    .floder-img {
      position: relative;
      display: inline-flex;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;
      background: #ffffff;
      border: 1px solid #cccccc;
      box-sizing: border-box;
      border-radius: 4px;

      img {
        width: 80px;
      }

      .title {
        position: absolute;
        bottom: 12px;
      }
    }

    .img {
      position: relative;
      width: 100%;
      height: 100%;
      border: 1px solid #cccccc;
      box-sizing: border-box;
      border-radius: 12px;
      background: #fff;
      overflow: hidden;
      cursor: pointer;
      display: flex;
      flex-direction: column;

      .checkbox {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 50;
      }

      .mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 40;
        background-color: rgba(0, 0, 0, 0.25);

        .wrapper {
          position: absolute;
          padding-left: 9px;
          padding-right: 9px;
          width: 100%;
          bottom: 5px;
          height: 100%;
          display: flex;
          justify-content: center;
          flex-direction: column;
          gap: 8px;
          .wrapper-line {
            display: flex;
            align-items: center;
            justify-content: center;
            .openBtn {
              flex: 1;
            }
          }
        }

        .frameWrapper {
          position: absolute;
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: repeat(2, 74px);
          justify-content: center;
          gap: 10px;
          align-content: center;
        }

        .openBtn {
          width: 74px;
          margin-left: 4px;
          margin-right: 4px;
        }
      }

      .relation-container {
        position: relative;
        overflow: hidden;
        width: 100%;
        flex: 1;
      }

      .text-box {
        background: #232932;
        height: 100%;
        color: white;
        padding: 15px 10px;
        .head {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: #e4f0fe;
          text-align: center;
          line-height: 16px;
          font-size: 10px;
          color: #57ccef;
        }
        .conversation {
          background: #515f74;
          border-radius: 12px;
          padding: 6px 8px;
          max-width: 70%;
          font-size: 11px;
          line-height: 16px;
          word-break: break-word;
        }
        .question {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 12px;
          .head {
            margin-right: 6px;
          }
          .conversation {
            border-top-left-radius: 0;
          }
        }
        .answer {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 12px;
          .head {
            margin-left: 6px;
          }
          .conversation {
            border-top-right-radius: 0;
          }
        }
      }

      .place {
        // margin-bottom: 6px;

        .pointCloudImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        &.image-card {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .name {
        width: 100%;
        text-align: center;
        font-size: 14px;
        font-weight: 400;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        position: absolute;
        height: 38px;
        bottom: 0;
        display: flex;
        z-index: 2;
        justify-content: center;
        align-items: center;
        left: 0;
        background: white;

        &.bottom {
        }
      }

      .easy-pc {
        pointer-events: none;
        color: red;
        position: absolute;
        width: 100%;
        aspect-ratio: 1;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
      }

      .easy-image {
        pointer-events: none;
        color: red;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
      }

      .camera {
        display: flex;
        margin-bottom: 38px;
        // margin-left: -3px;
        // margin-right: -3px;

        .img-item {
          width: 33.33%;
          // height: 50px;
          // margin-left: 3px;
          // margin-right: 3px;
          position: relative;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }
  }
</style>
