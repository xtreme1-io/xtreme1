<template>
  <div :class="`${prefixCls}`">
    <exportModalVue
      @register="register"
      :info="info"
      :classId="result"
      :classification="classification"
    />
    <div class="content">
      <div class="flex p-25px">
        <div class="mr-24px cursor-pointer" @click="handleBack">
          <Icon icon="material-symbols:arrow-back" />
          Back
        </div>
        <div>
          <Icon icon="material-symbols:info-rounded" color="#57CCEF" />
          This page allows you to search your data in this dataset by search ontologies
        </div>
      </div>
      <div class="flex pl-25px pr-25px">
        <Select
          dropdownClassName="custom-search-scenario"
          v-model:value="result"
          showSearch
          mode="multiple"
          style="flex: 1"
          @change="handleChange"
        >
          <Select.Option v-for="item in options" :key="item.id" :value="item.id">
            {{ item.name }}
          </Select.Option>
        </Select>
        <Button class="ml-20px" type="default" @click="openModal">Export Result</Button>
      </div>
      <div class="list" v-if="list.length > 0">
        <div class="item" v-for="item in list" :key="item.dataId + '#' + item.id">
          <SearchCard
            :info="info"
            :object2D="object2D[item?.classAttributes?.trackId]"
            :data="dataInfo[item.dataId]"
            :object="item"
          >
            <Button @click="() => handleSingleAnnotate(item.dataId, item)" type="primary"
              >Annotate</Button
            >
          </SearchCard>
        </div>
      </div>
      <div class="empty" v-else>
        <div class="text-center">
          <img class="inline-block mb-4" width="136" :src="datasetEmpty" alt="" />
          <div>Current Scenario is Empty</div>
        </div>
      </div>
    </div>
    <div class="filter">
      <div class="flex justify-between">
        <div>Filter</div>
        <div>
          <SvgIcon name="reload" />
        </div>
      </div>
      <div>
        <CollContainer icon="mdi:calendar-month" title="Status">
          <Checkbox.Group style="margin-top: 5px" v-model:value="classification">
            <Checkbox
              v-for="item in filterOptions"
              style="display: block"
              :value="item.attributeId + '^' + item.optionName"
              :key="item.attributeId + '^' + item.optionName"
            >
              {{ item.optionName }}
            </Checkbox>
          </Checkbox.Group>
        </CollContainer>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  // import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { Select, Checkbox } from 'ant-design-vue';
  import { Button } from '/@/components/BasicCustom/Button';
  import Icon, { SvgIcon } from '/@/components/Icon';
  import datasetEmpty from '/@/assets/images/dataset/dataset_empty.png';
  import { onMounted, ref, watch } from 'vue';
  import { goToTool } from '/@/utils/business';
  import {
    datasetItemDetail,
    getDatasetClass,
    getScenario,
    getDataByIds,
    getClassificationOptions,
    takeRecordByData,
    checkRootByDataId,
  } from '/@/api/business/dataset';
  import { useMessage } from '/@/hooks/web/useMessage';
  import SearchCard from './searchCard.vue';
  import { useRoute } from 'vue-router';
  import { datasetTypeEnum, dataTypeEnum } from '/@/api/business/model/datasetModel';
  import exportModalVue from './exportModal.vue';
  import { useModal } from '/@/components/Modal';
  import CollContainer from '/@@/CollContainer/index.vue';
  const [register, { openModal }] = useModal();
  const { query } = useRoute();
  const { id } = query;
  const { prefixCls } = useDesign('searchScenario');
  // const { t } = useI18n();
  const result = ref();
  const options = ref<any[]>(['gmail.com', '163.com', 'qq.com']);
  const list = ref<any[]>([]);
  const info = ref<any>();
  const classification = ref();
  const filterOptions = ref();
  const dataInfo = ref<Record<string, any>>({});
  const object2D = ref<Record<string, any>>({});
  const { createMessage } = useMessage();

  const handleChange = (e) => {
    if (e.length === 0) {
      result.value = [];
      filterOptions.value = [];
    } else if (e[1]) {
      result.value = [e[1]];
      fetchList();
      getOptions(e[1]);
    } else {
      result.value = [e[0]];
      fetchList();
      getOptions(e[0]);
    }
  };

  const handleBack = () => {
    window.history.go(-1);
  };

  watch(classification, (res) => {
    fetchList();
  });

  onMounted(() => {
    getInfo();
    fetchOption();
  });

  const getOptions = async (id) => {
    filterOptions.value = await getClassificationOptions({ classId: id as string });
    // fetchList(info.value.type);
  };

  const getInfo = async () => {
    info.value = await datasetItemDetail({ id: id as string });
  };

  const fetchOption = async () => {
    const list = await getDatasetClass(id);
    options.value = list;
  };

  const fetchList = async () => {
    console.log(classification.value);
    const res = await getScenario({
      classId: result.value.toString(),
      datasetId: info.value.id,
      datasetType: info.value.type,
      source: 'DATASET_CLASS',
      pageSize: 999,
      attributeIds: classification.value
        ? classification.value.map((item) => item.split('^')[0]).toString()
        : undefined,
      optionNames: classification.value
        ? classification.value.map((item) => item.split('^')[1]).toString()
        : undefined,
    });
    const _list: any[] = [];
    const dataIds = Array.from(new Set(res.list.map((item) => item.dataId)))
      .filter((item: any) => !dataInfo.value[item])
      .toString();
    if (dataIds.length) {
      const datas = await getDataByIds({
        datasetId: info.value.id,
        dataIds: dataIds,
      });
      datas.reduce((info, item) => {
        info[item.id] = item;
        return info;
      }, dataInfo.value);
    }
    if (info.value.type === datasetTypeEnum.LIDAR_FUSION) {
      const obj2dMap = {};
      res.list.forEach((item: any) => {
        const type = item.classAttributes.type || item.classAttributes.objType;
        const info = item.classAttributes;
        if (['2D_RECT', '2D_BOX', 'rect', 'box2d'].includes(type)) {
          if (!obj2dMap[info.trackId]) {
            obj2dMap[info.trackId] = [];
          }
          obj2dMap[info.trackId].push(item);
        } else {
          _list.push(item);
        }
      });
      Object.assign(object2D.value, obj2dMap);
      object2D.value = obj2dMap;
      list.value = _list;
    } else {
      list.value = res.list;
    }
  };

  const handleSingleAnnotate = async (dataId: any, object: any) => {
    const recordId = await takeRecordByData({
      datasetId: info.value.id,
      dataIds: [dataId],
      dataType: dataTypeEnum.SINGLE_DATA,
    }).catch(() => {});
    const trackId = object.classAttributes.trackId;
    const errMsg = 'The selected data has been annotated by others';
    if (!recordId || !trackId) {
      return createMessage.error(errMsg);
    }

    const status = await checkRootByDataId(recordId, dataId);
    if (!status) {
      return createMessage.error(errMsg);
    }
    // const res = await getLockedByDataset({
    //   datasetId: info.value.id,
    // });

    goToTool({ recordId: recordId, dataId: dataId, focus: trackId }, info.value?.type);
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-searchScenario';
  .@{prefix-cls} {
    color: #333;
    // background: #f2f5fa;
    display: flex;
    .select-tag {
      background: red;
    }
    .content {
      flex: 1;
    }
    .list {
      background: white;
      margin-top: 20px;
      margin-left: 25px;
      margin-right: 25px;
      padding: 12px;
      border-radius: 8px;
      .item {
        width: 240px;
        height: 240px;
        background-color: white;
        display: inline-block;
        margin: 6px;
        position: relative;
        border-radius: 6px;
        overflow: hidden;
      }
    }
    .empty {
      width: 100%;
      height: calc(100vh - 180px);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .filter {
      width: 220px;
      background: #fff;
      height: calc(100vh - @header-height);
      padding: 10px;
    }
  }
</style>
