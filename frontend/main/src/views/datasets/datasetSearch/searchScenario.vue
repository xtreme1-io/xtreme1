<template>
  <div :class="`${prefixCls}`">
    <exportModalVue
      @register="register"
      :info="info"
      :classId="result"
      :classification="classification"
    />

    <div class="content">
      <div class="actions flex">
        <VirtualTab :list="tabList" />
        <div style="flex: 1" class="flex pl-25px pr-25px custom-search-scenario">
          <Select
            showArrow
            size="large"
            dropdownClassName="custom-search-scenario"
            v-model:value="result"
            style="flex: 1"
            showSearch
            mode="multiple"
            @change="handleChange"
            :filter-option="handleFilter"
          >
            <Select.Option
              v-for="item in options"
              :key="item.id"
              :value="item.id"
              :name="item.name"
            >
              <div
                class="inline-flex items-center"
                :style="`background:${item.color};border-radius:300px;padding: 4px 10px;`"
              >
                <img class="mr-1" width="14" height="14" :src="toolTypeImg[item.toolType]" alt="" />
                {{ item.name }}
              </div>
            </Select.Option>
          </Select>
          <Button :size="ButtonSize.LG" class="ml-20px" type="default" @click="handleExport">{{
            t('common.exportText')
          }}</Button>
        </div>
      </div>
      <div class="Tabs flex">
        <Tabs @change="TabChange" v-model:activeKey="activeTab">
          <Tabs.TabPane key="File">
            <template #tab> File </template>
          </Tabs.TabPane>
          <Tabs.TabPane key="Scenario">
            <template #tab> Scenario </template>
          </Tabs.TabPane>
        </Tabs>
        <div class="tips">
          <Icon icon="material-symbols:info-rounded" color="#57CCEF" />
          This page allows you to search your data in this dataset by search ontologies
        </div>
      </div>

      <div class="list" v-show="list.length > 0">
        <ScrollContainer ref="scrollRef">
          <template v-for="item in list">
            <div class="item" v-if="dataInfo[item.dataId]" :key="item.dataId + '#' + item.id">
              <SearchCard :info="info" :data="dataInfo[item.dataId]" :object="item">
                <Button
                  @click="() => handleSingleAnnotate(dataInfo[item.dataId], item)"
                  type="primary"
                  >Annotate</Button
                >
              </SearchCard>
            </div>
          </template>
        </ScrollContainer>
      </div>
      <div class="empty" v-show="list.length === 0">
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
  import { ButtonSize } from '/@@/Button/typing';
  import { VirtualTab } from '/@@/VirtualTab';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { Select, Checkbox, message, Tabs } from 'ant-design-vue';
  import { Button } from '/@/components/BasicCustom/Button';
  import Icon, { SvgIcon } from '/@/components/Icon';
  import datasetEmpty from '/@/assets/images/dataset/dataset_empty.png';
  import { onMounted, ref, watch } from 'vue';
  import { goToTool } from '/@/utils/business';
  import {
    datasetItemDetail,
    getDatasetClass,
    getScenario,
    getRelationByIds,
    getClassificationOptions,
    takeRecordByData,
    // checkRootByDataId,
  } from '/@/api/business/dataset';
  import SearchCard from './searchCard.vue';
  import { useRoute } from 'vue-router';
  import { useGo } from '/@/hooks/web/usePage';
  import { datasetTypeEnum, dataTypeEnum } from '/@/api/business/model/datasetModel';
  import exportModalVue from './exportModal.vue';
  import { useModal } from '/@/components/Modal';
  import CollContainer from '/@@/CollContainer/index.vue';
  import { toolTypeImg } from '../../ontology/classes/attributes/data';
  import { ScrollContainer, ScrollActionType } from '/@/components/Container/index';
  import { handleScroll } from '/@/utils/business/scrollListener';
  import { ResultEnum } from '/@/enums/httpEnum';
  import { RouteChildEnum } from '/@/enums/routeEnum';
  import Scenario from '/@/assets/svg/tags/scenario.svg';
  import ScenarioActive from '/@/assets/svg/tags/scenarioActive.svg';
  import Data from '/@/assets/svg/tags/data.svg';
  import DataActive from '/@/assets/svg/tags/dataActive.svg';
  import Ontology from '/@/assets/svg/tags/ontology.svg';
  import OntologyActive from '/@/assets/svg/tags/ontologyActive.svg';
  import { useI18n } from 'vue-i18n';
  const [register, { openModal }] = useModal();
  const { query } = useRoute();
  const { id } = query;
  const { prefixCls } = useDesign('searchScenario');
  // const { t } = useI18n();
  const result = ref();
  const options = ref<any[]>([]);
  const allOptions = ref<any[]>([]);
  const list = ref<any[]>([]);
  const info = ref<any>();
  const classification = ref();
  const filterOptions = ref();
  const dataInfo = ref<Record<string, any>>({});
  const pageNo = ref<number>(1);
  const total = ref<number>(0);
  const scrollRef = ref<Nullable<ScrollActionType>>(null);
  const go = useGo();
  const { t } = useI18n();
  let activeTab = ref<any>('File');
  activeTab.value = 'Scenario';
  let TabChange = (val) => {
    if (val === 'File') {
      go(RouteChildEnum.DATASETS_DATA + `?id=${id}`);
    }
  };
  const tabList = [
    {
      name: t('business.dataset.overview'),
      url: RouteChildEnum.DATASETS_OVERVIEW,
      params: { id: id },
      icon: Scenario,
      activeIcon: ScenarioActive,
    },
    {
      name: t('business.datasetContent.data'),
      url: RouteChildEnum.DATASETS_DATA,
      active: true,
      icon: Data,
      activeIcon: DataActive,
    },
    {
      name: t('business.ontology.ontology'),
      url: RouteChildEnum.DATASETS_CLASS,
      params: { id: id },
      icon: Ontology,
      activeIcon: OntologyActive,
    },
  ];
  const handleChange = (e) => {
    pageNo.value = 1;
    if (e.length === 0) {
      result.value = [];
      filterOptions.value = [];
      list.value = [];
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

  watch(classification, () => {
    fetchList();
  });

  onMounted(() => {
    getInfo();
    fetchOption();
    handleScroll(scrollRef, () => {
      if (total.value > list.value.length) {
        pageNo.value++;
        fetchList(true);
      }
    });
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
    allOptions.value = list;
  };

  const fetchList = async (flag?) => {
    const res = await getScenario({
      classId: result.value.toString(),
      datasetId: info.value.id,
      datasetType: info.value.type,
      source: 'DATASET_CLASS',
      pageNo: pageNo.value,
      pageSize: 20,
      attributeIds: classification.value
        ? classification.value.map((item) => item.split('^')[0]).toString()
        : undefined,
      optionNames: classification.value
        ? classification.value.map((item) => item.split('^')[1]).toString()
        : undefined,
    });

    const _list: any[] = [];
    const dataIds = Array.from(new Set(res.list?.map((item) => item.dataId)))
      .filter((item: any) => !dataInfo.value[item])
      .toString();
    if (dataIds.length) {
      const datas = await getRelationByIds({
        datasetId: info.value.id,
        dataIds: dataIds,
      });
      datas.reduce((info, item) => {
        info[item.id] = item;
        return info;
      }, dataInfo.value);
    }
    if (info.value.type === datasetTypeEnum.LIDAR_FUSION) {
      const tempMap = {};
      res.list?.forEach((item: any) => {
        const { classAttributes: info, dataId, id, datasetId, lockedBy } = item;
        // const type = info.type || info.objType;

        if (!tempMap[dataId]) {
          tempMap[dataId] = {};
        }

        if (!tempMap[dataId][info.trackId]) {
          tempMap[dataId][info.trackId] = Object.assign([], {
            dataId: dataId,
            datasetId: datasetId,
            id: id,
            trackId: info.trackId,
            lockedBy: lockedBy,
          });
        }
        tempMap[dataId][info.trackId].push(item);
      });
      Object.values(tempMap).forEach((t: any) => {
        Object.values(t).forEach((e) => {
          _list.push(e);
        });
      });
      if (flag) {
        list.value = list.value.concat(_list) || [];
      } else {
        list.value = _list;
      }
    } else {
      if (flag) {
        list.value = list.value.concat(res.list) || [];
      } else {
        list.value = res.list || [];
      }
    }

    total.value = res.total;
  };

  const handleSingleAnnotate = async (data: any, object: any) => {
    const recordId = await takeRecordByData({
      datasetId: object.datasetId || info.value.id,
      dataIds: [object.dataId],
      operateItemType: data.type,
      isFilterData: true,
    }).catch((error: any = {}) => {
      const { code, message: msg } = error;
      if (code === ResultEnum.DATASET_DATA_EXIST_ANNOTATE) {
        message.error(
          `${data.name} is being edited by ${data.lockedBy || object.lockedBy || 'others'}`,
        );
      } else {
        message.error(msg || 'error');
      }
      return null;
    });
    const objectId = object.id || object.classAttributes.id;
    if (!recordId || !objectId) return;
    goToTool({ recordId: recordId, dataId: object.dataId, focus: objectId }, info.value?.type);
  };

  const handleExport = () => {
    if (!result.value || result.value.length === 0) {
      return message.error('please select a class first');
    }
    openModal();
  };

  const handleFilter = (input, option) => {
    window.console.log(input, option);
    return (option?.name ?? '').toLowerCase().includes(input.toLowerCase());
  };
  // setTimeout(() => {
  //   list.value = [{}];
  // }, 3000);
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
      padding: 10px 20px;
      flex: 1;
      .actions {
        justify-content: space-between;
        align-items: center;
      }
      .Tabs {
        margin-top: 10px;
        justify-content: flex-start;
        align-items: center;
        .tips {
          margin-left: 20px;
          padding-bottom: 10px;
        }
      }
    }
    .list {
      background: white;
      margin-top: 20px;
      margin-left: 25px;
      margin-right: 25px;
      padding: 12px;
      border-radius: 8px;
      height: calc(100vh - 230px);
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
      height: calc(100vh - 190px);
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
