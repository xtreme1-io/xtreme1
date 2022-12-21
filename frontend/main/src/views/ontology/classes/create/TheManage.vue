<template>
  <div class="manage_container">
    <div class="btn_box">
      <Button v-if="showPush" type="default" @click="handleToPush">
        {{ 'Push' }}
      </Button>
      <Button v-if="showPull" type="default" @click="handleToPull">
        {{ 'Pull' }}
      </Button>
      <Button type="primary" @click="handleManageAttr">
        {{ 'Manage attributes' }}
      </Button>
    </div>
    <div v-if="showPushBox || showPullBox" class="push_box">
      <div v-if="showPushBox" style="line-height: 16px; color: #333333">
        Are you sure you want to override all attributes in {{ className }} in {{ ontologyName }} by
        current attributes?
      </div>
      <div v-if="showPullBox" style="line-height: 16px; color: #333333">
        Are you sure you want to override all current attributes by {{ className }} in
        {{ ontologyName }}?
      </div>
      <div class="flex justify-end gap-10px">
        <Button @click="handleCloseBox">Cancel</Button>
        <Button type="primary" class="override" @click="handleOverride"> Override </Button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, onMounted, ref, watch } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Button } from '/@@/Button';
  import emitter from 'tiny-emitter/instance';
  import {
    ClassTypeEnum,
    ontologyClassItem,
    ToolTypeEnum,
  } from '/@/api/business/model/classesModel';
  import { OntologyListItem } from '/@/api/business/model/ontologyModel';
  import { getAllOntologyApi } from '/@/api/business/ontology';
  import { getAllClassByOntologyIdApi } from '/@/api/business/classes';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';

  const { createMessage } = useMessage();

  const props = defineProps<{
    isCenter: boolean;
    activeTab: ClassTypeEnum;
    datasetType: datasetTypeEnum;
    toolType: ToolTypeEnum | undefined;
    classId?: number;
    ontologyId?: number;
  }>();
  const emits = defineEmits(['manage']);

  const showPush = computed(() => {
    return !props.isCenter && props.activeTab == ClassTypeEnum.CLASS;
  });
  const showPull = computed(() => {
    return !props.isCenter && props.activeTab == ClassTypeEnum.CLASS;
  });

  const ontologyName = computed(() => {
    const target = ontologyList.value.find((item) => item.id == props.ontologyId);
    return target?.name ?? '';
  });
  const className = computed(() => {
    const target = classList.value.find((item) => item.id == props.classId);
    return target?.name ?? '';
  });
  /** Ontology List */
  const ontologyList = ref<OntologyListItem[]>([]);
  const getOntologyList = async () => {
    const res = await getAllOntologyApi({ type: props.datasetType });
    ontologyList.value = [...res];
  };
  onMounted(() => {
    getOntologyList();
  });
  watch(
    () => props.ontologyId,
    () => {
      setTimeout(async () => {
        await getClassList();
      }, 100);
    },
    {
      immediate: true,
    },
  );
  watch(
    () => props.classId,
    () => {
      handleCloseBox();
    },
  );

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

  /** Push */
  const showPushBox = ref<boolean>(false);
  const handleToPush = () => {
    if (className.value) {
      showPullBox.value = false;
      showPushBox.value = true;
    } else {
      createMessage.warning('Please pick one class you want to relate to at first');
    }
  };

  /** Pull */
  const showPullBox = ref<boolean>(false);
  const handleToPull = () => {
    if (className.value) {
      showPullBox.value = true;
      showPushBox.value = false;
    } else {
      createMessage.warning('Please pick one class you want to relate to at first');
    }
  };

  const handleCloseBox = () => {
    showPullBox.value = false;
    showPushBox.value = false;
  };
  const handleOverride = () => {
    if (showPullBox.value) {
      emitter.emit('pullClass');
    } else {
      emitter.emit('pushClass');
    }
    handleCloseBox();
  };

  /** Manage */
  const handleManageAttr = () => {
    emits('manage');
    handleCloseBox();
  };
</script>
<style lang="less" scoped>
  .manage_container {
    min-height: 32px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transform: translateY(-40px);
    margin-bottom: -35px;
    .btn_box {
      position: absolute;
      display: flex;
      gap: 10px;
      transform: translateX(120px);
    }

    .push_box,
    .pull_box {
      margin-top: 40px;
      padding: 10px;
      background: #ffffff;
      box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.15);
      border-radius: 8px;
      font-size: 14px;
      line-height: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      color: #333333;
      .override {
        background-color: #fcb17a;
      }
    }
  }
</style>
