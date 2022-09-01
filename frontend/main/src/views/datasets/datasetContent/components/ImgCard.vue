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
        <div class="place">
          <img class="pointCloudImg h-83px" :src="getPlaceImg()" alt="" />
        </div>
        <div class="camera">
          <img
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
          />
        </div>
        <div class="name"> {{ data.name }} </div>
      </template>
      <div
        class="mb-4 place"
        v-else-if="info?.type === datasetTypeEnum.LIDAR_BASIC"
        style="width: 100%; height: 100%"
      >
        <img class="object-cover pointCloudImg" :src="getPlaceImg()" alt="" />
        <div class="p-2 name"> {{ data.name }} </div>
      </div>
      <div v-else-if="info?.type === datasetTypeEnum.IMAGE" style="width: 100%; height: 100%">
        <img
          class="place image-card"
          :src="
            (data.content &&
              (data.content[0].file?.mediumThumbnail?.url || data.content[0].file?.url)) ||
            placeImg
          "
          alt=""
        />
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
  import placeImgFull from '/@/assets/images/dataset/basic-banner-content.png';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import { dataTypeEnum } from '/@/api/business/model/datasetModel';
  import { PageTypeEnum } from './data';
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
  };
  const emits = defineEmits([
    'handleSelected',
    'handleDelete',
    'handleSingleAnnotate',
    'handleAnotateFrame',
  ]);
  const props = defineProps<Props>();
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

  const getPlaceImg = () => {
    const placeImgType = props.info?.type === datasetTypeEnum.LIDAR_BASIC ? placeImgFull : placeImg;
    const pc = props.data.content.filter((item) => item.name === 'pointCloud')[0];
    return pc && pc.files ? pc.files[0].file?.renderImage?.url || placeImgType : placeImgType;
  };

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

      .camera{
        display: flex;
        margin-bottom: 5px;
        // margin-left: -3px;
        // margin-right: -3px;

        img{
          width: 33.33%;
          height: 46px;
          // padding-left: 3px;
          // padding-right: 3px;
        }
      }
    }
  }
</style>
