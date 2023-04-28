<template>
  <BasicModal
    @register="registerModal"
    v-bind="$attrs"
    title="Warning"
    cancelText="Annotate Anyway"
    okText="Config Ontology"
    :height="230"
    :minHeight="0"
    @ok="handleGo"
    @cancel="handleSuccess"
    :closable="false"
  >
    <div class="p-50px">
      You don't have any class or classification for your annotation, do you want to create them at
      first?
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { RouteChildEnum } from '/@/enums/routeEnum';
  import { useGo } from '/@/hooks/web/usePage';
  import { parseParam } from '/@/utils/business/parseParams';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  const { query } = useRoute();
  const { id } = query;
  const go = useGo();
  const mydata = ref();
  const props = defineProps<{
    datasetType: datasetTypeEnum;
  }>();

  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    mydata.value = data;
  });

  const handleGo = () => {
    if (props?.datasetType === datasetTypeEnum.TEXT) {
      go(parseParam(RouteChildEnum.DATASETS_CLASSIFICATION, { id: id as unknown as string }));
    } else {
      go(parseParam(RouteChildEnum.DATASETS_CLASS, { id: id as unknown as string }));
    }
  };

  const handleSuccess = () => {
    mydata.value.callback();
  };
</script>
