<template>
  <div class="flex flex-col gap-10px">
    <div class="related__select">
      <div class="related__select-ontology">
        <span>Ontology</span>
        <Select :value="props.ontologyId" @change="handleChangeOntology">
          <Select.Option v-for="item in ontologyList" :key="item.id" :value="item.id">
            <Tooltip :title="item.name">
              <span>{{ item.name }}</span>
            </Tooltip>
          </Select.Option>
        </Select>
      </div>
      <div class="related__select-class">
        <span>Class</span>
        <Select :value="props.classId" @change="handleChangeClass">
          <Select.Option v-for="item in classList" :key="item.id" :value="item.id">
            <Tooltip :title="item.name">
              <span>{{ item.name }}</span>
            </Tooltip>
          </Select.Option>
        </Select>
      </div>
    </div>
    <div class="related__preview">
      <span class="preview" @click="handlePreview">Preview attributes</span>
    </div>
  </div>
  <!-- Modal -->
  <TheAttributes
    @register="registerAttrModal"
    @back="handleBack"
    :formState="formState"
    :dataSchema="dataSchema"
    :activeTab="ClassTypeEnum.CLASS"
    :datasetType="props.datasetType"
    :datasetId="props.datasetId"
    :isCenter="props.isCenter"
    :title="modalTitle"
    :isPreview="true"
  />
</template>
<script lang="ts" setup>
  import { onMounted, ref, watch, inject } from 'vue';
  import { Select, message, Tooltip } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import TheAttributes from '../attributes/TheAttributes.vue';
  import emitter from 'tiny-emitter/instance';

  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import { getAllOntologyApi } from '/@/api/business/ontology';
  import { OntologyListItem } from '/@/api/business/model/ontologyModel';
  import {
    getAllClassByOntologyIdApi,
    getOntologyClassByIdApi,
    updateOntologyClassApi,
  } from '/@/api/business/classes';
  import {
    ClassTypeEnum,
    ontologyClassItem,
    ToolTypeEnum,
  } from '/@/api/business/model/classesModel';
  import { IDataSchema } from './typing';

  const props = defineProps<{
    dataSchema: IDataSchema;

    datasetType: datasetTypeEnum;
    toolType: ToolTypeEnum | undefined;

    isCenter?: boolean;
    datasetId?: number;

    ontologyId: number | undefined;
    classId: number | undefined;
  }>();

  const emits = defineEmits(['update:ontologyId', 'update:classId', 'update']);
  const changeLoading = inject('changeLoading', Function, true);

  const handleChangeOntology = (value) => {
    emits('update:ontologyId', value);
    emits('update:classId', undefined);
  };
  const handleChangeClass = (value) => {
    emits('update:classId', value);
  };

  watch(
    () => props.toolType,
    () => {
      // emits('update:ontologyId', undefined);
      emits('update:classId', undefined);
    },
  );
  watch(
    () => props.ontologyId,
    (newValue) => {
      if (newValue) getClassList();
      else classList.value = [];
    },
  );

  /** Ontology List */
  const ontologyList = ref<OntologyListItem[]>([]);
  const getOntologyList = async () => {
    const res = await getAllOntologyApi({ type: props.datasetType });

    ontologyList.value = [...res];
  };
  onMounted(() => {
    getOntologyList();
  });

  /** Class List */
  const classList = ref<ontologyClassItem[]>([]);
  const getClassList = async () => {
    if (props.ontologyId) {
      const res = await getAllClassByOntologyIdApi({
        ontologyId: props.ontologyId,
        toolType: props.toolType,
      });

      classList.value = [...res];
    }
  };

  /** Preview */
  const formState = ref<any>({});
  const dataSchema = ref<IDataSchema>({ attributes: [] });
  const modalTitle = ref<string>('');
  const [registerAttrModal, { openModal: openAttrModal, closeModal: closeAttrModal }] = useModal();
  const getTitle = () => {
    const selectedOntology: any = ontologyList.value.filter(
      (item: any) => item.id == props.ontologyId,
    );
    const selectedClass: any = classList.value.filter((item) => item.id == props.classId);
    return `Previewing ${selectedOntology.name}/ ${selectedClass.name}`;
  };
  const handlePreview = async () => {
    if (props.classId) {
      modalTitle.value = getTitle();

      const res = await getOntologyClassByIdApi({ id: props.classId });

      formState.value = { ...res };
      dataSchema.value = {
        attributes: res.attributes ?? [],
      };

      openAttrModal(true, {});
    } else {
      message.warning('Please pick one class you want to relate to at first');
    }
  };
  const handleBack = () => {
    closeAttrModal();
  };

  emitter.off('pushClass');
  emitter.on('pushClass', async () => {
    if (props.classId) {
      changeLoading(true);

      try {
        const res = await getOntologyClassByIdApi({ id: props.classId });
        const params: any = {
          ...res,
          attributes: props.dataSchema.attributes,
        };
        await updateOntologyClassApi(params);
      } catch (error) {
        message.error(String(error));
      }

      changeLoading(false);
    } else {
      message.warning('Please pick one class you want to relate to at first');
    }
  });

  emitter.off('pullClass');
  emitter.on('pullClass', async () => {
    if (props.classId) {
      changeLoading(true);

      try {
        const res = await getOntologyClassByIdApi({ id: props.classId });
        emits('update', {
          attributes: res.attributes,
        });
      } catch (error) {
        message.error(String(error));
      }

      changeLoading(false);
    } else {
      message.warning('Please pick one class you want to relate to at first');
    }
  });
</script>
<style lang="less" scoped>
  .related__select {
    display: flex;
    align-items: center;
    justify-content: space-between;
    &-ontology {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 260px;
    }
    &-class {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
    }
    :deep(.ant-select) {
      width: 160px;
      .ant-select-selector {
        height: 28px;
      }
    }
  }
  .related__preview {
    display: flex;
    justify-content: flex-end;
    .preview {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 6px 8px;
      background: #e6f0fe;
      border-radius: 5px;

      font-weight: 400;
      font-size: 14px;
      line-height: 16px;
      color: @primary-color;
      cursor: pointer;
    }
  }
</style>
