<template>
  <div :class="`${prefixCls}`">
    <ClassSelector @register="register" @handleChangeClass="handleChangeClass" />
    <div class="wrapper">
      <div class="action-bar">
        <div class="info-box">
          <div class="label"> {{ t('business.task.taskText') }}: </div>
          <div class="task-selector">
            <Select
              style="width: 280px"
              size="large"
              :value="currentTask"
              :options="taskList"
              @change="handleChangeTask"
            />
          </div>
        </div>
        <div class="actions">
          <div class="btn">
            <Button block :size="ButtonSize.LG" type="default" @click="handleCreate">
              {{ t('business.task.createTask') }}
            </Button>
          </div>
          <template v-if="!detail || detail?.status === TaskStatusEnum.UN_PUBLISH">
            <div class="btn">
              <Button :size="ButtonSize.LG" danger block @click="handleDelete">
                {{ t('common.delText') }}
              </Button>
            </div>
            <div class="btn">
              <Button block :size="ButtonSize.LG" type="default" @click="handleSave">
                {{ t('common.saveText') }}
              </Button>
            </div>
            <div class="btn">
              <Button block :size="ButtonSize.LG" type="primary" @click="handlePublish">
                {{ t('common.publishText') }}
              </Button>
            </div>
          </template>
          <template v-else-if="detail?.status === TaskStatusEnum.PUBLISHED">
            <div class="btn">
              <Button :size="ButtonSize.LG" danger block @click="handleClose">
                {{ t('business.task.closeTask') }}
              </Button>
            </div>
            <div class="btn">
              <Button block :size="ButtonSize.LG" type="primary" @click="handleSaveChange">
                {{ t('business.task.saveChange') }}
              </Button>
            </div>
          </template>
          <template v-else>
            <div class="btn">
              <Button block :size="ButtonSize.LG" type="primary" disabled>
                {{ t('business.task.closed') }}
              </Button>
            </div>
          </template>
        </div>
      </div>
      <div class="title">{{ t('business.task.instruction') }}</div>
      <div class="instruction">
        <div class="editor">
          <Tinymce
            v-model="instruction"
            @change="handleChange"
            width="100%"
            :plugins="plugins"
            :toolbar="toolbar"
          />
        </div>
      </div>
      <div class="title">
        <div>{{ t('business.class.classes') }}</div>
        <div class="manage-btn" v-if="detail?.status === TaskStatusEnum.UN_PUBLISH">
          <Button type="default" @click="openModal">{{ t('business.task.manageClass') }}</Button>
        </div>
      </div>
      <div class="class-selected-list">
        <ClassCard
          v-for="item in classList"
          :key="item.id"
          :record="item"
          @handleRemoveClass="handleRemoveClass"
          :status="detail?.status"
        />
        <div class="add-class-card" @click="(openModal as any)">
          <div>
            <Icon style="color: #ccc; cursor: pointer" icon="teenyicons:add-outline" size="50" />
          </div>
          <div class="text">Add Class</div>
        </div>
      </div>
      <div class="title">Annotation Flow</div>
      <FlowPanel
        :list="stageList"
        @handleAddStage="handleAddStage"
        @handleDel="handleDel"
        @handleClearUser="handleClearUser"
        @addUser="addUser"
        :status="detail?.status"
      />
      <div class="config">
        <Form
          ref="formRef"
          :model="formState"
          labelAlign="left"
          :label-col="{ span: 7 }"
          :wrapper-col="{ span: 5 }"
        >
          <Form.Item label="Batch Size">
            <Input autocomplete="off" v-model:value="formState.batchSize" />
          </Form.Item>
          <Form.Item label="Max batch time（minutes）">
            <Input autocomplete="off" v-model:value="formState.maxStageTime" />
          </Form.Item>
          <!-- <Form.Item :wrapper-col="{ span: 24 }">
            <Checkbox />
            <span class="ml-2">Allow the same worker to do multiple steps in one workflow</span>
          </Form.Item> -->
        </Form>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onBeforeMount, ref, unref, provide, UnwrapRef, reactive } from 'vue';
  import { Form, Input } from 'ant-design-vue';
  import { Tinymce } from '/@/components/Tinymce/index';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { Select } from '/@@/Select';
  import { Button, ButtonSize } from '/@@/Button';
  import FlowPanel from './components/FlowPanel.vue';
  import ClassSelector from './components/ClassSelector.vue';
  import { useModal } from '/@/components/Modal';
  import Icon from '/@/components/Icon';
  import ClassCard from './components/ClassCard.vue';
  import { teamListApi } from '/@/api/business/team';
  import { TeamUserList } from '/@/api/business/model/teamModel';
  import { ClassItem } from '/@/api/business/model/classModel';
  import { useRoute } from 'vue-router';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    closeTaskApi,
    deleteTaskApi,
    getTaskApi,
    getTaskDefaultApi,
    getTaskListApi,
    publishTaskApi,
    saveChangeTaskApi,
    saveTaskApi,
  } from '/@/api/business/task';
  import { StageItem, TaskDetail, TaskStatusEnum } from '/@/api/business/model/taskModel';
  import { useLoading } from '/@/components/Loading';
  import { useMessage } from '/@/hooks/web/useMessage';
  type OptionsItem = { label: string; value: string | number; disabled?: boolean };
  const { createMessage } = useMessage();
  const [register, { openModal }] = useModal();
  const { query } = useRoute();
  const { id } = query;
  const { t } = useI18n();
  const [openFullLoading, closeFullLoading] = useLoading({
    tip: t('common.loadingText'),
  });
  const taskList = ref<OptionsItem[]>([]);
  const classList = ref<ClassItem[]>([]);
  const currentTask = ref<Nullable<number | string>>(null);
  const userList = ref<TeamUserList>([]);
  const stageList = ref<StageItem[]>([]);
  let count = ref(1);
  let tempId = 5;
  const defaultTaskName = 'Untitled Task';
  const formRef = ref();
  const detail = ref<Partial<TaskDetail>>();
  const defaultDetail = ref<TaskDetail>();

  const plugins = [
    'advlist anchor autolink autosave code codesample  directionality  fullscreen hr insertdatetime link lists media nonbreaking noneditable pagebreak paste preview print save searchreplace spellchecker tabfocus  template  textpattern visualblocks visualchars wordcount',
  ];
  const toolbar = [
    'fontsizeselect bold italic underline strikethrough alignleft aligncenter alignright outdent indent  blockquote undo redo',
  ];

  interface FormState {
    batchSize: number;
    maxStageTime: number;
  }

  const handleChangeTask = (e) => {
    currentTask.value = e;
    fetchDetail();
  };

  const formState: UnwrapRef<FormState> = reactive({
    batchSize: 10,
    maxStageTime: 120,
  });

  const { prefixCls } = useDesign('dataset-task');
  // let sortable: Sortable;

  onBeforeMount(async () => {
    const res = await teamListApi();
    userList.value = res.list;
    await fetchList();
    await fetchDetail();
  });

  const fetchList = async () => {
    openFullLoading();
    const resp = await getTaskListApi({ id: id as string });
    let total = 1;
    taskList.value = resp.map((item) => {
      if (item.name?.includes(defaultTaskName) && Number(item.name.split(' ')[1]) >= total) {
        total = Number(item.name.split(' ')[1]);
      }
      return {
        value: item.id,
        label: item.name,
      };
    });

    if (taskList.value.length > 0 && taskList.value[0].value) {
      currentTask.value = taskList.value[0]?.value;
    }

    count.value = total;
    closeFullLoading();
  };

  const fetchDetail = async () => {
    openFullLoading();
    if (currentTask.value && typeof currentTask.value === 'number') {
      if (defaultDetail.value) {
        detail.value = { ...defaultDetail.value, name: `${defaultTaskName} ${count.value}` };
      } else {
        detail.value = await getTaskApi({
          id: currentTask.value,
          datasetId: id as string,
        });
      }
    } else {
      detail.value = await getTaskDefaultApi({
        id: id as string,
      });
    }
    instruction.value = unref(detail)?.instruction || '';
    classList.value = unref(detail)?.classList || [];
    stageList.value =
      unref(detail)?.stageList?.map((item) => ({
        ...item,
        tempId: tempId++,
        operatorIds: item.operatorIds,
      })) || [];
    formState.batchSize = unref(detail)?.batchSize || 10;
    formState.maxStageTime = (unref(detail)?.maxStageTime || 7200) / 60;
    closeFullLoading();
  };

  provide('userList', userList);

  const instruction = ref('');

  function handleChange(value: string) {
    console.log(value);
  }
  const handleChangeClass = (list) => {
    classList.value = list;
  };
  const handleRemoveClass = (id) => {
    console.log(id);
    classList.value = classList.value.filter((item) => item.id !== id);
  };

  // const handleResetForm = () => {
  //   classList.value = [];
  //   instruction.value = '';
  //   formRef.value.resetFields();
  // };

  const handleCreate = () => {
    currentTask.value = `${defaultTaskName} ${count.value}`;
    detail.value = undefined;
    fetchDetail();
    count.value += 1;
  };
  const handleDelete = async () => {
    if (detail.value?.id) {
      openFullLoading();
      await deleteTaskApi({
        id: detail.value?.id,
      });
      closeFullLoading();
    }
    await fetchList();
    currentTask.value = taskList.value[0].value;
    fetchDetail();
  };

  const getParams = () => {
    console.log(detail.value);
    const params: any = {
      ...detail.value,
      instruction: instruction.value,
      classList: classList.value.map((item) => ({ ...item, active: undefined })),
      stageList: stageList.value.map((item) => ({
        ...item,
        isAnyone: item.operatorIds.length === 0,
        tempId: undefined,
      })),
      ...formState,
      maxStageTime: formState.maxStageTime * 60,
      name:
        typeof currentTask.value === 'number' || !currentTask.value
          ? detail.value?.name
          : currentTask.value,
    };
    return params;
  };
  const handleSave = async () => {
    // TODO 入参参数还没定，先用any
    const params = getParams();
    console.log(params);
    await saveTaskApi(params);
    await fetchList();
    fetchDetail();
  };

  const handlePublish = async () => {
    // TODO 入参参数还没定，先用any
    const params = getParams();
    console.log(params);
    if (params.classList.length === 0) {
      return createMessage.error('please select class');
    }
    await publishTaskApi(params);
    await fetchList();
    fetchDetail();
  };

  const addUser = (id, userId) => {
    const userlistTemp = stageList.value.filter((item) => item.tempId === id)[0].operatorIds;
    console.log(userlistTemp);
    if (userlistTemp.includes(userId)) {
      if (userlistTemp.length > 0) {
        console.log(userlistTemp);
        stageList.value
          .filter((item) => item.tempId === id)[0]
          .operatorIds.splice(
            userlistTemp.findIndex((item) => item === userId),
            1,
          );
      }
    } else {
      stageList.value.filter((item) => item.tempId === id)[0].operatorIds.push(userId);
    }
  };
  const handleClearUser = (id) => {
    unref(stageList).filter((item) => item.tempId === id)[0].operatorIds = [];
  };
  const handleDel = (id) => {
    const index = unref(stageList).findIndex((item) => item.tempId === id);
    unref(stageList).splice(index, 1);
  };

  const handleAddStage = (type) => {
    unref(stageList).push({
      tempId: tempId++,
      datasetId: id as string,
      type: type,
      operatorIds: [],
    });
  };

  const handleSaveChange = async () => {
    const params: any = {
      id: detail.value?.id,
      datasetId: detail.value?.datasetId,
      instruction: instruction.value,
      stageList: stageList.value.map((item) => ({
        ...item,
        isAnyone: item.operatorIds.length === 0,
        tempId: undefined,
      })),
    };
    await saveChangeTaskApi(params);
    fetchDetail();
  };

  const handleClose = async () => {
    await closeTaskApi({ id: detail.value?.id as string });
    fetchDetail();
  };
</script>
<style lang="less" scoped>
  @import url('./index.less');
</style>
