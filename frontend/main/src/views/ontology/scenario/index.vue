<template>
  <div :class="`${prefixCls}`" v-loading="loadingRef">
    <div class="classes__left">
      <div class="actions">
        <VirtualTab :list="tabListOntology" />
      </div>
    </div>
    <exportModalVue
      @register="register"
      :info="info"
      :classId="result"
      :classification="classification"
      type="ONTOLOGY"
    />
    <div class="content mt-20px">
      <div class="flex custom-search-scenario">
        <Select
          dropdownClassName="custom-search-scenario"
          v-model:value="result"
          showSearch
          mode="multiple"
          style="flex: 1"
          @change="handleChange"
          :filter-option="handleFilter"
        >
          <Select.Option v-for="item in options" :key="item.id" :value="item.id" :name="item.name">
            <div
              class="inline-flex items-center"
              :style="`background:${item.color};border-radius:300px;padding: 4px 10px;`"
            >
              <img class="mr-1" width="14" height="14" :src="toolTypeImg[item.toolType]" alt="" />
              {{ item.name }}
            </div>
          </Select.Option>
        </Select>
        <Button class="ml-20px" type="default" @click="handleExport">Export Result</Button>
      </div>
      <div class="list" v-show="list.length > 0">
        <ScrollContainer ref="scrollRef">
          <template v-for="item in list">
            <div class="item" v-if="dataInfo[item.dataId]" :key="item.dataId + '#' + item.id">
              <SearchCard
                :showInfo="true"
                :info="info"
                :data="dataInfo[item.dataId]"
                :object="item"
              >
                <Button
                  @click="() => handleSingleAnnotate(dataInfo[item.dataId], item)"
                  type="primary"
                >
                  Annotate
                </Button>
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
  </div>
</template>
<script lang="ts" setup>
  // vue
  // components
  import { VirtualTab } from '/@@/VirtualTab';
  import { message } from 'ant-design-vue';
  // icons
  import Ontology from '/@/assets/svg/tags/ontology.svg';
  import OntologyActive from '/@/assets/svg/tags/ontologyActive.svg';
  import Scenario from '/@/assets/svg/tags/scenario.svg';
  import ScenarioActive from '/@/assets/svg/tags/scenarioActive.svg';
  // utils
  import { useI18n } from '/@/hooks/web/useI18n';
  import { RouteChildEnum } from '/@/enums/routeEnum';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { Select } from 'ant-design-vue';
  import { Button } from '/@/components/BasicCustom/Button';
  import datasetEmpty from '/@/assets/images/dataset/dataset_empty.png';
  import { onMounted, ref, watch } from 'vue';
  import { goToTool } from '/@/utils/business';
  import {
    getScenario,
    getRelationByIds,
    getClassificationOptions,
    takeRecordByData,
  } from '/@/api/business/dataset';
  // import { useMessage } from '/@/hooks/web/useMessage';
  import SearchCard from '../../datasets/datasetSearch/searchCard.vue';
  import { useRoute } from 'vue-router';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import exportModalVue from '../../datasets/datasetSearch/exportModal.vue';
  import { useModal } from '/@/components/Modal';
  import { getAllClassByOntologyIdApi } from '/@/api/business/classes';
  import { getOntologyInfoApi } from '/@/api/business/ontology';
  import { toolTypeImg } from '../classes/attributes/data';
  import { ScrollContainer, ScrollActionType } from '/@/components/Container/index';
  import { handleScroll } from '/@/utils/business/scrollListener';
  import { ResultEnum } from '/@/enums/httpEnum';
  const { t } = useI18n();
  const { prefixCls } = useDesign('ontologyScenario');
  const loadingRef = ref<boolean>(false);
  const [register, { openModal }] = useModal();
  const { query } = useRoute();
  const { id } = query;
  // const { t } = useI18n();
  const result = ref();
  const options = ref<any[]>(['gmail.com', '163.com', 'qq.com']);
  const list = ref<any[]>([]);
  const info = ref<any>();
  const classification = ref();
  const filterOptions = ref();
  const dataInfo = ref<Record<string, any>>({});
  const pageNo = ref<number>(1);
  const total = ref<number>(0);
  const scrollRef = ref<Nullable<ScrollActionType>>(null);

  /** Virtual Tab */
  const tabListOntology = [
    {
      name: t('business.ontology.ontology'),
      url: RouteChildEnum.ONTOLOGY_CLASS,
      active: false,
      params: {
        id: id,
      },
      icon: Ontology,
      activeIcon: OntologyActive,
    },
    {
      name: t('business.ontology.scenario'),
      url: RouteChildEnum.ONTOLOGY_SCENARIO,
      active: true,
      params: {
        id: id,
      },
      icon: Scenario,
      activeIcon: ScenarioActive,
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
    info.value = await getOntologyInfoApi({ id: id as string });
  };

  const fetchOption = async () => {
    const list = await getAllClassByOntologyIdApi({
      ontologyId: id as string,
    });
    options.value = list;
  };

  const fetchList = async (flag?) => {
    console.log(classification.value);
    const res = await getScenario({
      classId: result.value.toString(),
      // datasetId: info.value.id,
      datasetType: info.value.type,
      source: 'ONTOLOGY',
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
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-ontologyScenario';
  .@{prefix-cls} {
    // display: flex;
    height: 100%;
    padding: 15px 20px;
    .empty {
      width: 100%;
      height: calc(100vh - 180px);
      display: flex;
      align-items: center;
      justify-content: center;
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
  }
</style>
