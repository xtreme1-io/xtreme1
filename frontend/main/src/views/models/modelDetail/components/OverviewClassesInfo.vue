<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    class="modal"
    :width="900"
    wrapClassName="overview-classes-info-modal"
    :footer="null"
    @cancel="onCancel"
  >
    <div class="modal-container">
      <div class="cursor-pointer left" v-show="index != 0" @click="handleBack">
        <Icon icon="material-symbols:arrow-back-ios-new" size="30" color="#CCCCCC" />
      </div>
      <div class="classInfo_container">
        <div class="wrapper">
          <div class="title">{{ content.title }}</div>
          <div class="carousel" v-if="content.imgList && content.imgList.length > 0">
            <Carousel
              arrows
              :dots="false"
              :slides-to-show="3"
              :slides-to-scroll="1"
              :infinite="false"
              :afterChange="onAfterChange"
            >
              <template #prevArrow>
                <div
                  class="custom-slick-arrow left"
                  :class="showLeftArrow ? '' : 'hidden'"
                  style="left: -53px"
                >
                </div>
              </template>
              <template #nextArrow>
                <div
                  class="custom-slick-arrow right"
                  :class="showRightArrow ? '' : 'hidden'"
                  style="right: -53px"
                >
                </div>
              </template>
              <div v-for="(item, r) in content.imgList" :key="r">
                <Image :width="234" :height="186" class="object-cover height-fill" :src="item">
                  <template #placeholder>
                    <Image
                      class="object-cover height-fill"
                      src="data:image/png;base64,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"
                    />
                  </template>
                </Image>
              </div>
            </Carousel>
          </div>
          <div class="info">{{ content.description }} </div>
        </div>
      </div>
      <div
        class="cursor-pointer right"
        v-show="index != groupClass.length - 1"
        @click="handleForward"
      >
        <Icon icon="material-symbols:arrow-forward-ios" size="30" color="#CCCCCC" />
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { Carousel, Image } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import Icon from '/@/components/Icon';

  const index = ref(0);

  const [register] = useModalInner((params) => {
    index.value = params.index;
  });

  const title = ref<string>('');
  const imgList = ref<string[]>([]);
  const description = ref<string>('');
  const props = defineProps<{
    groupClass: any;
  }>();

  const content = computed(() => {
    console.log(props.groupClass);
    return {
      title: props.groupClass[index.value].name,
      imgList: props.groupClass[index.value].images,
      description: props.groupClass[index.value].description,
    };
  });

  const showLeftArrow = computed(() => {
    return currentSlideNum.value > 0;
  });
  const showRightArrow = computed(() => {
    return currentSlideNum.value < imgList.value.length - 3;
  });

  const currentSlideNum = ref<number>(0);
  const onAfterChange = (value) => {
    currentSlideNum.value = value;
  };

  const handleBack = () => {
    index.value = index.value - 1;
  };
  const handleForward = () => {
    index.value = index.value + 1;
  };

  const onCancel = () => {
    title.value = '';
    imgList.value = [];
    description.value = '';
  };
</script>
<style lang="less">
  .overview-classes-info-modal {
    color: red;

    .ant-modal-header {
      display: none;
    }

    .modal-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 200px;
    }

    .classInfo_container {
      position: relative;
      padding: 26px 66px 8px;
      display: flex;
      flex-direction: column;
      gap: 10px;

      .title {
        font-weight: 500;
        font-size: 20px;
        line-height: 23px;
        color: #333333;
        margin-bottom: 5px;
      }

      .carousel {
        .height-fill {
          height: 100%;
        }

        .ant-carousel {
          .slick-slider {
            height: 186px;
            line-height: 186px;

            .custom-slick-arrow {
              height: 40px;
              width: 22px;
              color: #ccc;
              z-index: 9;
              transition: all 0.3s;
              background-repeat: no-repeat;
              background-size: cover;

              &.left {
                background-image: url('/@/assets/images/models/left.svg');

                &:hover {
                  background-image: url('/@/assets/images/models/leftActive.svg');
                }
              }

              &.right {
                background-image: url('/@/assets/images/models/right.svg');

                &:hover {
                  background-image: url('/@/assets/images/models/rightActive.svg');
                }
              }

              &.hidden {
                display: none !important;
              }

              &:before {
                display: none;
              }

              &:hover {
                color: @primary-color;
              }
            }

            .slick-list {
              .slick-track {
                display: flex;
                flex-wrap: nowrap;

                .slick-slide {
                  width: 234px !important;
                  height: 186px !important;
                  overflow: hidden;

                  &:not(:last-child) {
                    margin-right: 20px;
                  }
                }
              }
            }
          }
        }
      }

      .info {
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        color: #333333;
      }
    }
  }
</style>
