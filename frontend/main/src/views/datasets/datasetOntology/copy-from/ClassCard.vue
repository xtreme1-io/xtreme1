<template>
  <div :class="`${prefixCls}`">
    <div
      v-for="item in props.cardList"
      :key="item.ontologyId"
      class="card"
      :class="{ active: selectItem == item.id }"
      @click="handleSelect(item)"
    >
      <template v-if="props.activeTab == ClassTypeEnum.CLASS">
        <div class="card__title">
          <img :src="toolTypeImg[item.toolType]" />
          <Tooltip placement="topLeft" :title="item.name">
            <span>{{ item.name }}</span>
          </Tooltip>
        </div>
        <div class="card__text" :style="{ background: item.color }">
          <span>{{ item.name }}</span>
        </div>
        <div class="card__attribute">
          <span>{{ t('business.class.attributes') + '：' }}</span>
          <span>{{ getAttributeLength(item.attributes) }}</span>
        </div>
      </template>
      <template v-if="props.activeTab == ClassTypeEnum.CLASSIFICATION">
        <div class="card__title">
          <!-- <img :src="classificationSvg" /> -->
          <img :src="inputItemImg[item.inputType]" />
          <Tooltip placement="topLeft" :title="item.name">
            <span>{{ item.name }}</span>
          </Tooltip>
        </div>
        <div class="card__img">
          <img :src="CardImage" alt="" />
        </div>
      </template>
      <div class="card__date">
        <span>{{ t('business.class.createdDate') + '：' }}</span>
        <span>{{ getDate(item.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, watch } from 'vue';
  // 工具
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { ClassTypeEnum } from '/@/api/business/model/ontologyClassesModel';
  import { getDate } from '/@/utils/business/timeFormater';
  // 图片
  import { toolTypeImg, inputItemImg } from '../components/modal-components/data';
  // import classificationSvg from '/@/assets/svg/classification.svg';
  import CardImage from '/@/assets/images/ontology/cardImage.png';
  import { Tooltip } from 'ant-design-vue';

  const { t } = useI18n();
  const { prefixCls } = useDesign('cardItem');

  const emits = defineEmits(['select']);
  const props = withDefaults(
    defineProps<{
      // cardList: ResponseClassificationParams[] | ResponseClassParams[];
      cardList: any[];
      activeTab: ClassTypeEnum;
      isCenter?: boolean;
    }>(),
    {
      isCenter: true,
    },
  );

  watch(
    () => props.cardList,
    () => {
      selectItem.value = undefined;
    },
  );
  const handleSelect = (item) => {
    selectItem.value = item.id;
  };
  const selectItem = ref();
  watch(selectItem, (newVal) => {
    emits('select', unref(newVal));
  });

  // 获取 attributes 长度
  const getAttributeLength = (attributes) => {
    const res = attributes ?? [];
    return res.length;
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-cardItem';
  .@{prefix-cls} {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 100px;
    grid-auto-rows: 100px;
    gap: 20px;

    .card {
      position: relative;
      width: 100%;
      height: 100%;
      padding: 4px;
      border-radius: 4px;
      background-color: #fff;
      font-weight: 400;
      font-size: 14px;
      overflow: hidden;
      border: 1px solid #ccc;
      box-sizing: border-box;

      .card__title {
        display: flex;
        align-items: center;
        width: 100%;
        height: 16px;
        margin-bottom: 4px;
        font-size: 12px;

        img {
          width: 12px;
          height: 12px;
          margin-right: 8px;
        }

        span {
          padding-right: 24px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        }
      }

      .card__text {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 36px;
        font-weight: 700;
        font-size: 18px;
        margin-bottom: 6px;
        color: #ffffff;

        span {
          width: 100%;
          padding: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        }
      }

      .card__img {
        height: 49px;
        background-color: #fff;
        margin-bottom: 6px;

        img {
          width: 100%;
          height: 100%;
        }
      }

      .card__attribute {
        line-height: 12px;
        font-size: 12px;
        // font-size: 16px;
        // transform: scale(0.6);
        // margin-left: -40%;
        // width: 200%;
        margin-bottom: 4px;
      }

      .card__date {
        line-height: 12px;
        font-size: 12px;
        // font-size: 16px;
        // transform: scale(0.6);
        // margin-left: -40%;
        // width: 200%;
        white-space: nowrap;
      }
    }

    .active {
      border: 1px solid transparent;
      box-shadow: 0 0 0 3px #57ccef;
    }
  }
</style>
