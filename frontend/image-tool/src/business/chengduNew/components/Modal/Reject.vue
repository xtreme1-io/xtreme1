<template>
  <div class="modal-reject">
    <a-row>
      <a-col :span="6" class="title">{{ t('image.TargetStage') }}</a-col>
      <a-col :span="18">
        <a-radio-group v-model:value="state.toStageId" @change="rejectStageChanged">
          <a-radio :value="item.id" v-for="(item, index) in data.stages" :key="index">{{
            item.name
          }}</a-radio>
        </a-radio-group>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="6" class="title">{{ t('image.Worker') }}</a-col>
      <a-col :span="18">
        <a-radio-group v-model:value="state.worker">
          <a-row>
            <a-radio value="ORIGINAL">{{ t('image.Worker') }}</a-radio>
            <span class="title1">{{ t('image.WhoSubmitted') }}</span>
          </a-row>
          <a-row>
            <a-radio value="NEW">{{ t('image.New') }}</a-radio>
            <span class="title1">{{ t('image.AssignWorker') }}</span>
          </a-row>
        </a-radio-group>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="6" class="title">{{ t('image.Result') }}</a-col>
      <a-col :span="18">
        <a-radio-group v-model:value="state.clearResult" :disabled="state.clearDisable">
          <a-row
            ><a-radio value="0">{{ t('image.KeepResults') }}</a-radio
            ><span class="title1">{{ t('image.KeepAllResults') }}</span>
          </a-row>
          <a-row>
            <a-radio value="1">{{ t('image.ClearResults') }}</a-radio>
            <span class="title1">{{ t('image.ClearAllTruthResults') }}</span>
          </a-row>
        </a-radio-group>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="6" class="title">{{ t('image.RejectReasons') }}</a-col>
      <a-col :span="18">
        <a-textarea v-model:value="state.reason" placeholder="" :rows="4" />
      </a-col>
    </a-row>
    <div style="margin-top: 20px; text-align: right">
      <a-button type="primary" style="width: 90px; height: 36px" ghost @click="onCancel">
        {{ t('image.Cancel') }}
      </a-button>
      <a-button type="primary" style="margin-left: 10px; width: 90px; height: 36px" @click="onOk">
        {{ t('image.confirm') }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, onMounted } from 'vue';
  import { IStage, StageEnum } from '../../type';
  import { t } from '@/lang';
  // ***************Props and Emits***************
  const emit = defineEmits(['cancel', 'ok']);
  const props = withDefaults(
    defineProps<{
      data: {
        stages: IStage[];
        toStageId: string;
      };
    }>(),
    {
      data: () => {
        return {
          stages: [],
          toStageId: '',
        };
      },
    },
  );
  // ***************Props and Emits***************
  const state = reactive({
    toStageId: '',
    clearDisable: false,
    clearResult: '0',
    worker: 'ORIGINAL',
    reason: '',
    loading: false,
  });
  onMounted(() => {
    state.toStageId = props.data.toStageId;
  });
  function valid(): Promise<boolean> {
    return Promise.resolve(true);
  }

  function onCancel() {
    emit('cancel');
  }

  function onOk() {
    emit('ok');
  }
  function rejectStageChanged() {
    const stages = props.data.stages;
    const curStage = stages.find((stage) => state.toStageId === stage.id);
    if (curStage && curStage.type === StageEnum.ANNOTATION) {
      state.clearDisable = false;
    } else {
      state.clearResult = '0';
      state.clearDisable = true;
    }
  }

  function getData(): any {
    return {
      toStageId: state.toStageId,
      isClearResult: state.clearResult === '1',
      reworkWorkerType: state.worker,
      reworkReason: state.reason,
    };
  }

  defineExpose({
    valid,
    getData,
  });
</script>

<style lang="less">
  .modal-reject {
    .ant-row {
      min-height: 30px;
    }

    .title {
      padding-right: 20px;
      text-align: right;
    }

    .title1 {
      font-size: 12px;
      color: #999999;
    }
  }
</style>
