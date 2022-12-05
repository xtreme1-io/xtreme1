<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="modalTitle"
    :okText="t('business.ontology.copy.next')"
    centered
    destroyOnClose
    @ok="handleNext"
    :okButtonProps="{ disabled: canNotNext }"
    :width="740"
    :height="540"
  >
    <div class="copy-modal">
      <div class="header">
        <Form>
          <Row>
            <Col :span="12">
              <Form.Item
                :label="t('business.ontology.ontology')"
                :labelCol="{ span: 6 }"
                :wrapperCol="{ span: 12 }"
              >
                <!-- 获取 ontology 下拉列表 -->
                <!-- 0.3修改为查询同类型的ontology -->
                <!-- <ApiSelect
              :api="(getOntologyByTeamApi as any)"
              v-model:value="model[field]"
              :params="{ type: props.datasetType }"
              labelField="name"
              valueField="id"
              showSearch
              @options-change="onOptionsChange"
              @change="onChange"
            /> -->
                <Select
                  v-model:value="ontologyId"
                  optionFilterProp="label"
                  :disabled="!hasOntology"
                >
                  <Select.Option
                    v-for="item in ontologyList"
                    :key="item.id"
                    @select="handleSelectOntology"
                  >
                    {{ item.name }}
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col :span="12">
              <Form.Item label="" :wrapperCol="{ span: 12, offset: 12 }">
                <Input.Search
                  v-model:value="searchValue"
                  :placeholder="t('business.ontology.copy.inputToSearch')"
                  :disabled="!hasOntology"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
      <div v-if="hasOntology" class="content" v-loading="loadingRef">
        <ClassCard
          v-if="cardList.length > 0"
          :cardList="cardList"
          :activeTab="props.activeTab"
          @select="handleSelect"
        />
        <template v-if="!loadingRef">
          <div v-if="cardList.length == 0" class="empty">
            <div v-if="props.activeTab == ClassTypeEnum.CLASS" class="tip">
              {{ t('business.ontology.emptyClass') }}
            </div>
            <div v-else class="tip">
              {{ t('business.ontology.emptyClassification') }}
            </div>
          </div>
        </template>
      </div>
      <div v-else class="content">
        <div class="no-ontology">
          <span>{{ t('business.ontology.copy.copyPlaceholder') }}</span>
          <div>
            <span @click="handleToOntology" class="cursor-pointer" style="color: #57ccef">
              {{ t('business.ontology.copy.copyOntologyCenter') }}
            </span>
            <span>{{ t('business.ontology.copy.copyToCreate') }}</span>
          </div>
        </div>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, unref, watch, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useGo } from '/@/hooks/web/usePage';
  import { RouteEnum } from '/@/enums/routeEnum';
  // 组件
  import { Form, Select, Input, Row, Col } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  // import { FormSchema, useForm } from '/@/components/Form/index';
  import ClassCard from './ClassCard.vue';
  // 接口
  import { getOntologyByTeamApi } from '/@/api/business/ontology';
  import { getClassApi, getClassificationApi } from '/@/api/business/ontologyClasses';
  import {
    GetListParams,
    ClassItem,
    ClassificationItem,
    ClassTypeEnum,
  } from '/@/api/business/model/ontologyClassesModel';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';

  const [registerModal, { closeModal }] = useModalInner((_) => {
    getOntologyList();
  });
  const { t } = useI18n();
  const { createMessage } = useMessage();
  const go = useGo();

  const emits = defineEmits(['copy']);
  const props = defineProps<{ activeTab: ClassTypeEnum; datasetType: datasetTypeEnum }>();

  // 搜索框
  const searchValue = ref<string>('');
  // ontology 下拉框
  const ontologyId = ref<string>('');
  const ontologyList = ref();
  // 获取 ontology 下拉框数据
  const getOntologyList = async () => {
    const res = await getOntologyByTeamApi({ type: props.datasetType, name: '' });
    ontologyList.value = res;
    // ontologyId.value = ontologyList.value?.[0]?.id;
  };
  const hasOntology = computed(() => {
    return ontologyList.value?.length > 0;
  });

  // 当前标题，根据 activeTab 判断
  const modalTitle = ref<string>('');
  watch(
    [() => props.activeTab, () => props.datasetType],
    ([newVal]) => {
      // 调整标题
      if (newVal == ClassTypeEnum.CLASS) {
        modalTitle.value = t('business.ontology.copy.copyClass');
      } else {
        modalTitle.value = t('business.ontology.copy.copyClassification');
      }
      // 获取 ontology 下拉列表
      getOntologyList();
    },
    {
      immediate: true,
    },
  );

  // 注册表单
  // const schemas: FormSchema[] = [
  //   {
  //     field: 'ontologyId',
  //     label: t('business.ontology.ontology'),
  //     component: 'ApiSelect',
  //     slot: 'remoteSearch',
  //     colProps: { span: 12 },
  //     defaultValue: 'Default ontology',
  //   },
  //   {
  //     field: 'name',
  //     label: '',
  //     component: 'Input',
  //     slot: 'searchInput',
  //     colProps: { span: 6, offset: 6 },
  //   },
  // ];
  // const [registerForm] = useForm({
  //   schemas,
  //   labelWidth: 80,
  //   actionColOptions: {
  //     span: 24,
  //   },
  // });

  // 下拉框选择事件
  const handleSelectOntology = (e) => {
    ontologyId.value = e;
  };
  // ontologyId变化, searchValue变化
  let timeout;
  watch([ontologyId, searchValue], () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      console.log('changed', ontologyId.value, searchValue.value);
      getList();
    }, 400);
  });

  // 根据 ontologyId 获取列表
  let cardList = ref<Array<ClassItem | ClassificationItem>>([]);
  const loadingRef = ref<boolean>(false);
  const getList = async () => {
    handleClearSelect();
    loadingRef.value = true;

    const postData: GetListParams = {
      pageNo: 1,
      pageSize: 12,
      ontologyId: Number(ontologyId.value),
      name: searchValue.value,
    };
    cardList.value = [];

    let res;
    try {
      if (props.activeTab == ClassTypeEnum.CLASS) {
        res = await getClassApi(postData);
      } else {
        res = await getClassificationApi(postData);
      }

      cardList.value = cardList.value.concat(res.list);
    } catch (error: any) {
      createMessage.error(String(error));
      cardList.value = [];
    }
    loadingRef.value = false;
  };
  // const hasCard = computed(() => {
  //   return cardList.value?.length > 0;
  // });

  // Next 按钮
  const canNotNext = ref<boolean>(true);
  // 点击卡片选择事件
  const handleSelect = (item) => {
    console.log(item);
    if (!!item) {
      canNotNext.value = false;
      copyId.value = item;
    } else {
      canNotNext.value = true;
    }
  };
  // 清空选项，重置按钮
  const handleClearSelect = () => {
    canNotNext.value = true;
    copyId.value = null;
  };
  // 前往本体中心
  const handleToOntology = () => {
    go(RouteEnum.ONTOLOGY);
  };

  // 保存
  const copyId = ref();
  const handleNext = () => {
    emits('copy', unref(copyId));
    closeModal();
  };
</script>
<style scoped lang="less">
  .copy-modal {
    padding: 30px;
    padding-bottom: 12px;

    .header {
      height: 58px;
      width: 100%;
    }

    .content {
      height: 312px;
      padding: 20px;
      border: 1px solid #cccccc;
      box-sizing: border-box;
      border-radius: 4px;
      overflow-x: hidden;
      overflow-y: auto;

      .empty {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        line-height: 32px;

        .tip {
          margin-top: 15px;
          margin-bottom: 15px;
          color: @primary-color;
        }
      }
    }

    .no-ontology {
      padding-top: 20px;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      line-height: 32px;
      color: #666;
    }
  }

  :deep(.ant-select-dropdown) {
    top: 36px !important;
  }

  :deep(.ant-select-selection-item) {
    text-align: left;
  }

  :deep(.ant-form-item) {
    margin-bottom: 0;
  }
</style>
