<template>
  <div
    :class="`${prefixCls}`"
    @mouseenter="handleOver"
    @mouseleave="handleLeave"
    :style="info?.type !== datasetTypeEnum.LIDAR_FUSION ? 'margin-bottom: 20px' : ''"
  >
    <div class="lockInfo" v-if="data.lockedBy">
      <Icon icon="bx:bxs-lock" /> Editing by {{ data.lockedBy }}
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
                () => {
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
                () => {
                  emits('handleAnotateFrame', data.id);
                }
              "
            >
              Annotate
            </Button>
          </div>
          <div class="openBtn">
            <Button type="danger" block border @click="handleDel">Delete</Button>
          </div>
        </div>
        <div class="wrapper" v-else>
          <div class="openBtn" v-if="type !== PageTypeEnum.frame">
            <Button
              type="primary"
              block
              border
              @click="
                () => {
                  handleView(data.id, isFrame());
                }
              "
            >
              View
            </Button>
          </div>
          <div class="openBtn" v-if="type !== PageTypeEnum.frame">
            <Button
              type="primary"
              block
              border
              @click="
                () => {
                  handleAnnotate(data.id);
                }
              "
            >
              Annotate
            </Button>
          </div>
          <div class="openBtn">
            <Button type="danger" block border @click="handleDel">Delete</Button>
          </div>
        </div>
      </div>
      <div class="floder-img" v-if="isFrame()">
        <img :src="floder" alt="" />
        <div class="title"> {{ data.name }} </div>
      </div>
      <template v-else-if="info?.type === datasetTypeEnum.LIDAR_FUSION">
        <div class="place relation-container">
          <img class="pointCloudImg h-83px" :src="getPlaceImg()" alt="" />
          <svg ref="svg" class="easy-pc" fill="transparent" stroke-width="1" stroke="currentColor">
            <polygon v-for="item in iState.pcObject" :key="item.id" :points="item.points" />
          </svg>
        </div>
        <div class="camera">
          <div
            class="img-item"
            v-for="(item, index) in [0, 1, 2]"
            :ref="(e) => setRef(e, index)"
            :key="item"
          >
            <img :key="item" :src="getPcImage(iState.pcImageObject[item])" alt="" />
            <svg class="easy-image" stroke-width="1" stroke="currentColor" fill="transparent">
              <template v-for="_item in iState.pcImageObject[item]?.object || []">
                <polygon v-if="_item.type === '2D_RECT'" :key="_item.id" :points="_item.points" />
                <polyline
                  v-else-if="_item.type === '2D_BOX'"
                  :key="_item.uuid"
                  :points="_item.points"
                />
              </template>
            </svg>
          </div>
          <!-- <img
            v-for="item in data.content
              ? data.content
                  .filter((record) => record?.directoryType?.includes('image'))
                  .slice(0, 3)
              : []"
            :key="item.name"
            :src="
              (item?.files && item?.files[0]?.file?.mediumThumbnail?.url) ||
              (item?.files && item?.files[0]?.file?.url) ||
              placeImg
            "
            alt=""
          /> -->
        </div>
        <div class="name"> {{ data.name }} </div>
      </template>
      <div
        class="mb-4 place relation-container"
        v-else-if="info?.type === datasetTypeEnum.LIDAR_BASIC"
        style="width: 100%; height: 100%"
      >
        <img class="object-cover pointCloudImg" :src="getPlaceImg()" alt="" />
        <svg ref="svg" class="easy-pc" fill="transparent" stroke-width="1" stroke="currentColor">
          <polygon v-for="item in iState.pcObject" :key="item.id" :points="item.points" />
        </svg>
        <div class="p-2 name"> {{ data.name }} </div>
      </div>
      <div
        v-else-if="info?.type === datasetTypeEnum.IMAGE"
        class="relation-container"
        style="width: 100%; height: 100%"
      >
        <img
          class="place image-card"
          ref="svg"
          @load="() => onImgLoad(data)"
          :src="getImageUrl(data) || placeImg"
          alt=""
        />
        <svg
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
        </svg>
        <!-- <img
          class="place image-card"
          :src="
            (data.content &&
              (data.content[0].file?.mediumThumbnail?.url || data.content[0].file?.url)) ||
            placeImg
          "
          alt=""
        /> -->
        <div class="name"> {{ data.name }} </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref, unref, defineProps, defineEmits } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { Checkbox } from 'ant-design-vue';
  import Button from '/@@/Button/index.vue';
  import floder from '/@/assets/images/dataset/frameSeriesImg.png';
  import { Modal } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  // import { useGo } from '/@/hooks/web/usePage';
  // import { RouteEnum } from '/@/enums/routeEnum';
  import { DatasetItem, DatasetListItem } from '/@/api/business/model/datasetModel';
  import placeImg from '/@/assets/images/dataset/fusion-banner-content.png';
  // import placeImgFull from '/@/assets/images/dataset/basic-banner-content.png';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import { dataTypeEnum } from '/@/api/business/model/datasetModel';
  import { PageTypeEnum } from './data';
  import { useImgCard } from './useCardObject';
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
  };
  const emits = defineEmits([
    'handleSelected',
    'handleDelete',
    'handleSingleAnnotate',
    'handleAnotateFrame',
  ]);
  const props = defineProps<Props>();
  const { iState, size, svg, getPcImage, getPlaceImg, setRef, onImgLoad, getImageUrl } =
    useImgCard(props);
  const dataId = unref(props).data.id;
  // const originalUrl = unref(props).data.files ? unref(props).data.files[0].url.originalUrl : null;
  const { prefixCls } = useDesign('img-card');
  // const go = useGo();
  const hover = ref<boolean>(false);
  const checked = ref<boolean>(false);
  const { t } = useI18n();

  const getMaskClass = computed(() => {
    return unref(hover) ? 'mask animate-fadeIn animate-animated' : 'mask hidden';
  });
  const getCheckboxClass = computed(() => {
    return unref(hover) || unref(props.isSelected) ? 'checkbox' : 'checkbox hidden';
  });
  const handleOver = () => {
    handleTrigger(true);
  };
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

  // const handleGo = () => {
  //   go(`${RouteEnum.DATASETS}/detail?id=${dataId}`);
  // };

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
  .@{prefix-cls}{
    // padding: 0 10px;
    // margin-bottom: 20px;
    position: relative;
    width: 272px;
    height: 175px;

    .lockInfo{
      position: absolute;
      right: 20px;
      top: 6px;
      color: white;
      z-index: 1;
      max-width: 150px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .floder-img {
        position: relative;
        display: inline-flex;
        width: 100%;
        // height: 100%;
        justify-content: center;
        align-items: center;
        background: #ffffff;
        border: 1px solid #cccccc;
        box-sizing: border-box;
        border-radius: 4px;
        height: 100%;

        img {
          width: 80px;
        }

        .title {
          position: absolute;
          bottom: 12px;
        }
      }

    .img{
      position: relative;
      width: 272px;
      height: 175px;
      border: 1px solid #CCCCCC;
      box-sizing: border-box;
      padding: 6px;
      border-radius: 4px;
      background: #fff;

      .name{
        width: 100%;
        text-align: center;
        font-size: 14px;
        font-weight: 400;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .checkbox{
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 50;
      }

      .mask{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 40;
        background-color: rgba(0,0,0,.25);

        .wrapper{
          position: absolute;
          width: 100%;
          bottom: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .frameWrapper{
          position: absolute;
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: repeat(2,74px);
          justify-content: center;
          gap: 10px;
          align-content: center;
        }

        .openBtn{
          width: 74px;
          margin-left: 4px;
          margin-right: 4px;
        }

      }
      .relation-container{
        position: relative;
        overflow: hidden;
        width: 100%;
      }
      .place{
        // margin-bottom: 6px;

        .pointCloudImg{
          width: 100%;
          max-height: 100%;
          object-fit: cover;
        }

        &.image-card{
          width: 100%;
          height: 100%;
          object-fit: cover;
          margin-bottom: 5px
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
      .camera{
        display: flex;
        margin-bottom: 5px;
        // margin-left: -3px;
        // margin-right: -3px;

        .img-item {
          width: 33.33%;
          height: 50px;
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
