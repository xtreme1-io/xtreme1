<template>
  <div :class="`${prefixCls}`">
    <RenameModal @register="renameRegister" :id="itemId" :name="data.name" />
    <DeleteModal @register="deleteRegister" :id="itemId" :name="data.name" />
    <div
      class="card-content"
      @click="
        () => {
          handleGo(props.data.id);
        }
      "
    >
      <template v-if="data.datas === null">
        <div style="width: 100%">
          <img
            style="width: 100%; height: 144px"
            v-if="data.type === datasetTypeEnum.IMAGE"
            :src="imageEmpty"
            alt=""
          />
          <img
            style="width: 100%; height: 144px"
            v-if="data.type === datasetTypeEnum.LIDAR_FUSION"
            :src="fusionEmpty"
            alt=""
          />
          <img
            style="width: 100%; height: 144px"
            v-if="data.type === datasetTypeEnum.LIDAR_BASIC"
            :src="basicEmpty"
            alt=""
          />
        </div>
      </template>
      <template v-else>
        <div class="img-content" v-if="data.type === datasetTypeEnum.IMAGE">
          <div class="img" v-for="(item, index) in new Array(6)" :key="item">
            <img v-lazyload="getImgUrl(index)" alt="" />
          </div>
        </div>
        <div class="img-content" v-else-if="data.type === datasetTypeEnum.LIDAR_FUSION">
          <div class="wrapper">
            <div class="banner-img">
              <img class="pcRender" v-lazyload="getPcImgUrl()" alt="" />
            </div>
            <div class="img-fusion-camera">
              <img v-for="item in new Array(3)" :key="item" v-lazyload="getLidarImgUrl()" alt="" />
            </div>
          </div>
        </div>
        <div class="img-content" v-else>
          <div class="wrapper">
            <div class="banner-img-full">
              <img class="pcRender" v-lazyload="getPcImgUrl()" alt="" />
            </div>
          </div>
        </div>
      </template>

      <div class="text-content">
        <div class="name flex justify-between">
          {{ props.data.name }}
          <div class="more" @click.stop>
            <Icon icon="akar-icons:more-horizontal" />
            <div class="action-list">
              <div
                class="item"
                @click="
                  (e) => {
                    handleRename(e, props.data);
                  }
                "
              >
                <img class="ml-3 mr-2" src="../../../../assets/icons/rename.svg" alt="" />
                <span class="text-sm">{{ t('common.renameText') }}</span>
              </div>
              <div
                class="item"
                @click="
                  (e) => {
                    handleDelete(e, props.data);
                  }
                "
              >
                <img
                  class="ml-3 mr-2 color-gray-400"
                  src="../../../../assets/icons/delete.svg"
                  alt=""
                />
                <span class="text-sm text-red-500">{{ t('common.delText') }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="field">
          items:
          <span class="data">{{ calcCount(props.data.itemCount) }} </span>
        </div>
        <div class="type-count">
          <div class="type-item">
            <SvgIcon name="annotated" />
            <span class="data">{{ calcCount(props.data.annotatedCount) }}</span>
          </div>
          <div class="type-item">
            <SvgIcon name="notAnnotated" />
            <span class="data">{{ calcCount(props.data.notAnnotatedCount) }}</span>
          </div>
          <div class="type-item">
            <SvgIcon name="invalid" />
            <span class="data">{{ calcCount(props.data.invalidCount) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import RenameModal from './RenameModal.vue';
  import DeleteModal from './DeleteModal.vue';
  import { useModal } from '/@/components/Modal';
  import { defineProps } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useGo } from '/@/hooks/web/usePage';
  import { RouteEnum } from '/@/enums/routeEnum';
  import { DatasetListItem, datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import fusionBanner from '/@/assets/images/dataset/fusion-banner.png';
  import bannerFull from '/@/assets/images/dataset/dataset-card-banner-full.png';
  import placeImg from '/@/assets/images/placeImg.png';
  import placeImgSm from '/@/assets/images/placeImg_sm.png';
  import basicEmpty from '/@/assets/images/dataset/basicEmpty.png';
  import fusionEmpty from '/@/assets/images/dataset/fusionEmpty.png';
  import imageEmpty from '/@/assets/images/dataset/imageEmpty.png';
  import Icon, { SvgIcon } from '/@/components/Icon';
  import { setDatasetBreadcrumb } from '/@/utils/business';
  const [renameRegister, { openModal: openRenameModal }] = useModal();
  const [deleteRegister, { openModal: openDeleteModal }] = useModal();
  const { t } = useI18n();
  const { prefixCls } = useDesign('card');
  type Props = {
    data: DatasetListItem;
  };

  const getLidarImgUrl = () => {
    const content = props.data.datas && props.data.datas[0]?.content;
    if (content && content[0] && content[0].files) {
      const files = content.filter((record) => record.directoryType?.includes('image'))[0]?.files;
      if (files && files[0].file) {
        const file = files[0].file;
        return file.mediumThumbnail?.url || file.url || placeImgSm;
      }
    } else {
      const file = content && content[0] && content[0].file;
      return file?.mediumThumbnail?.url || file?.url || placeImgSm;
    }
    return placeImgSm;
  };

  const calcCount = (num) => {
    if (num > 1000000000) {
      return `${(num / 1000000000).toFixed(2)} B`;
    } else if (num > 1000000) {
      return `${(num / 1000000).toFixed(2)} M`;
    }
    return num || 0;
  };

  const getImgUrl = (index) => {
    return (
      (props.data.datas &&
        props.data.datas[index]?.content &&
        props.data.datas[index]?.content[0]?.file?.url) ||
      placeImg
    );
  };

  const getPcImgUrl = () => {
    const placeImgType =
      props.data?.type === datasetTypeEnum.LIDAR_BASIC ? bannerFull : fusionBanner;
    const pc = props.data.datas[0]?.content.filter((item) => item.name === 'pointCloud')[0];
    return (pc && pc.files && pc?.files[0].file?.renderImage?.url) || placeImgType;
  };

  const itemId = ref();
  const itemName = ref();
  const props = defineProps<Props>();
  // const emit = defineEmits(['fetchList', 'closeCreateModal']);
  const go = useGo();
  const handleGo = (id) => {
    setDatasetBreadcrumb(props.data.name, props.data.type);
    go(`${RouteEnum.DATASETS}/overview?id=${id}`);
  };
  const handleRename = (e, data) => {
    e.stopPropagation();
    itemId.value = data.id;
    itemName.value = data.name;
    openRenameModal();
  };
  const handleDelete = async (e, data) => {
    e.stopPropagation();
    itemId.value = data.id;
    itemName.value = data.name;
    openDeleteModal();
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-card';

  .@{prefix-cls}{
    position: relative;
    margin-bottom: 20px;

    .more{
      // position: absolute;
      // right: 5px;
      // bottom: 0px;
      padding: 0 5px;

      &:hover{
        .action-list{
          display: block;
        }
      }

      .action-list{
        display: none;
        position: absolute;
        padding: 10px 0;
        right: 0;
        background: #FFFFFF;
        box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.15);
        border-radius: 12px;
        z-index: 200;

        .item{
          cursor: pointer;
          width: 160px;
          height: 36px;
          line-height: 36px;
          display: flex;
          align-items: center;

          &:hover{
            background: rgba(87, 204, 239, 0.15);
          }
        }

        &:hover{
          display: block;
        }
      }
    }

    .card-content{
      // padding: 10px;
      background: #fff;
      border: 1px solid #CCCCCC;
      height: 253px;
      border-radius: 12px;
      position: relative;
      margin: 0 10px;
      overflow:hidden;

      &:hover{
        box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.15);
      }

      .img-content{
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        border-radius: 12px 12px 0 0;
        overflow: hidden;

        .wrapper{
          width: 100%;
          display: flex;
          height: 144px;

          .banner-img{
            flex: 1;

            .pcRender{
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .banner-img-full{
            width: 100%;
          }
        }

        .img-fusion-camera{
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          // flex: 1;

          img{
            width: 82px;
            flex: 1;
          }
        }

        .img{
          flex-shrink: 0;
          width: 33.3%;
          height: 72px;
        }

        img{
          width: 100%;
          height: 100%;
          // padding: 4px 4px;
        }
      }

      .text-content{
        margin-top: 8px;
        line-height: 21px;
        padding: 5px 10px;

        .name{
          font-size: 18px;
          white-space: nowrap;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .field{
          margin-top: 6px;
          margin-bottom: 11px;
          font-size: 12px;
          color: #AAA;

          .data{
            color: #57CCEF;
          }
        }

        .type-count{
          display: flex;

          .type-item{
            margin-right: 16px;
            color: #666;

            .data{
              margin-left: 5px;
            }
          }
        }
      }
    }
  }
</style>
