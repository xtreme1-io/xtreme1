<template>
  <div class="flex flex-col gap-10px">
    <div class="related__select">
      <div class="related__select-ontology">
        <span>Ontology</span>
        <Select v-model:value="selectedOntologyId">
          <Select.Option v-for="item in ontologyList" :key="item.id" :value="item.id">
            <span>{{ item.name }}</span>
          </Select.Option>
        </Select>
      </div>
      <div class="related__select-class">
        <span>Class</span>
        <Select v-model:value="selectedClassId">
          <Select.Option v-for="item in classList" :key="item.id" :value="item.id">
            <span>{{ item.name }}</span>
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
    :classId="props.classId"
    :title="modalTitle"
    :isPreview="true"
  />
</template>
<script lang="ts" setup>
  import { ref, watch } from 'vue';
  import { Select } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import TheAttributes from '../attributes/TheAttributes.vue';
  import emitter from 'tiny-emitter/instance';

  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import { getAllOntologyApi } from '/@/api/business/ontology';
  import { OntologyListItem } from '/@/api/business/model/ontologyModel';
  import { getAllClassByOntologyIdApi, getOntologyClassByIdApi } from '/@/api/business/classes';
  import {
    ClassTypeEnum,
    ontologyClassItem,
    ToolTypeEnum,
  } from '/@/api/business/model/classesModel';
  import { IDataSchema } from './typing';

  const props = defineProps<{
    datasetType: datasetTypeEnum;
    toolType: ToolTypeEnum | undefined;

    isCenter?: boolean;
    datasetId?: number;
    ontologyId?: number | null; // for edit
    classId?: number;
  }>();
  // const emits = defineEmits(['preview']);
  watch(
    () => props.toolType,
    () => {
      getOntologyList();
    },
  );

  /** Ontology List */
  const ontologyList = ref<OntologyListItem[]>([]);
  const getOntologyList = async () => {
    selectedOntologyId.value = undefined;
    selectedClassId.value = undefined;

    const res = await getAllOntologyApi({ type: props.toolType });

    ontologyList.value = [...res];
  };

  /** Ontology Select */
  const selectedOntologyId = ref<number | string>();
  watch(selectedOntologyId, () => {
    selectedClassId.value = undefined;
    getClassList();
  });

  /** Class List */
  const selectedClassId = ref<number | string>();
  const classList = ref<ontologyClassItem[]>([]);
  const getClassList = async () => {
    if (selectedOntologyId.value) {
      const res = await getAllClassByOntologyIdApi({
        ontologyId: selectedOntologyId.value,
        toolType: props.toolType,
      });

      classList.value = [...res];
    }
  };

  const getTitle = () => {
    const selectedOntology: any = ontologyList.value.filter(
      (item) => item.id == selectedOntologyId.value,
    );
    const selectedClass: any = classList.value.filter((item) => item.id == selectedClassId.value);

    return `Previewing ${selectedOntology.name}/ ${selectedClass.name}`;
  };

  /** Preview */
  const formState = ref<any>({});
  const dataSchema = ref<IDataSchema>({ attributes: [] });
  const modalTitle = ref<string>('');
  const [registerAttrModal, { openModal: openAttrModal, closeModal: closeAttrModal }] = useModal();
  const handlePreview = async () => {
    if (selectedClassId.value) {
      modalTitle.value = getTitle();

      const res = await getOntologyClassByIdApi({ id: selectedClassId.value });

      formState.value = { ...res };
      dataSchema.value = {
        attributes: res.attributes ?? [],
      };

      openAttrModal(true, {});
    }
  };
  const handleBack = () => {
    closeAttrModal();
  };

  emitter.off('pushClass');
  emitter.on('pushClass', async () => {
    console.log('pushClass');
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
