<template>
  <div :class="`${prefixCls}`">
    <BasicDrawer
      v-bind="$attrs"
      destroyOnClose
      @register="register"
      headerStyle="display:none"
      width="220px"
      @visible-change="handleChange"
    >
      <component
        v-if="activeTab === ClassTypeEnum.CLASS"
        :is="component"
        :dataSchema="classDataSchema"
        :detail="props.detail"
        :indexList="indexList"
        :handleSet="handleSet"
        :handleAddIndex="handleAddIndex"
        :activeTab="activeTab"
        :handleRemoveIndex="handleRemoveIndex"
        :handleChangeTab="handleChangeTab"
        @handleSubmit="handleSubmit"
      />
      <component
        v-else
        :is="component"
        :dataSchema="dataSchema"
        :indexList="indexList"
        :detail="props.detail"
        :handleSet="handleSet"
        :handleAddIndex="handleAddIndex"
        :activeTab="activeTab"
        :handleRemoveIndex="handleRemoveIndex"
        :handleChangeTab="handleChangeTab"
        @handleSubmit="handleSubmit"
      />
      <template #footer>
        <div v-if="indexList.length > 0" class="footer">
          <div class="btn">
            <Button block type="primary" @click="handleDone">
              {{ t('common.doneText') }}
            </Button>
          </div>
          <div class="btn">
            <Button block type="default" @click="handleDel">
              {{ t('common.delText') }}
            </Button>
          </div>
        </div>
        <div v-else class="footer">
          <div class="btn">
            <Button block type="primary" @click="handleCall">
              {{ t('common.saveText') }}
            </Button>
          </div>
          <div class="btn">
            <Button block type="default" @click="handleClose">
              {{ t('common.cancelText') }}
            </Button>
          </div>
        </div>
      </template>
    </BasicDrawer>
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, computed, defineEmits, defineProps, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { Button } from '/@@/Button';
  import { setSchema, setClassSchema, handleMutiTabAction } from './utils';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import emitter from 'tiny-emitter/instance';
  // import { inputType } from './typing';
  import BaseForm from './BaseForm.vue';
  import AttrForm from './AttrForm.vue';
  import OptionForm from './OptionForm.vue';
  import { createEditClassApi } from '/@/api/business/class';
  import { ClassItem, ClassTypeEnum } from '/@/api/business/model/classModel';
  import { useRoute } from 'vue-router';
  const emits = defineEmits(['fetchList']);
  const { query } = useRoute();
  const { id } = query;
  const { prefixCls } = useDesign('form-drawer');
  const { t } = useI18n();
  const [register, { closeDrawer }] = useDrawerInner();
  const props = defineProps<{ detail: Nullable<ClassItem> }>();
  const indexList = ref<number[]>([]);
  const activeTab = ref<ClassTypeEnum>(ClassTypeEnum.CLASS);
  const component = computed(() => {
    if (unref(indexList).length === 0) {
      return BaseForm;
    }
    console.log(activeTab.value, unref(indexList).length);
    if (activeTab.value === ClassTypeEnum.CLASS) {
      if (unref(indexList).length % 2 !== 0) {
        return AttrForm;
      } else if (unref(indexList).length % 2 === 0) {
        return OptionForm;
      }
    } else {
      if (unref(indexList).length % 2 === 0) {
        return AttrForm;
      } else if (unref(indexList).length % 2 !== 0) {
        return OptionForm;
      }
    }

    return null;
  });
  const handleChangeTab = (type: ClassTypeEnum) => {
    activeTab.value = type;
  };
  const getInitClassData = () => {
    return {
      attributes: [],
    };
  };
  const getInitClassificationData = () => {
    return {
      options: [],
    };
  };

  const classDataSchema = ref(getInitClassData());
  const dataSchema = ref(getInitClassificationData());

  const handleChange = async (visible) => {
    if (visible) {
      handleDetail();
    }
  };

  const handleDetail = () => {
    if (props.detail) {
      activeTab.value = props.detail.type;
      handleMutiTabAction(
        activeTab.value,
        () => {
          classDataSchema.value = {
            attributes: JSON.parse(props.detail?.attributes),
          };
        },
        () => {
          dataSchema.value = {
            options: JSON.parse(props.detail?.attributes),
          };
        },
      );
    } else {
      classDataSchema.value = getInitClassData();
      dataSchema.value = getInitClassificationData();
    }
    indexList.value = [];
  };

  onMounted(() => {
    handleDetail();
  });

  const handleSet = (setOption) => {
    handleMutiTabAction(
      activeTab.value,
      () => {
        setClassSchema(classDataSchema, indexList.value, setOption);
      },
      () => {
        setSchema(dataSchema, indexList.value, setOption);
      },
    );
  };

  const handleAddIndex = (index) => {
    unref(indexList).push(index);
  };
  const handleSubmit = async (data) => {
    console.log(data);
    const temp = {
      ...data,
      type: activeTab.value,
      datasetId: id as string,
    };
    handleMutiTabAction(
      activeTab.value,
      async () => {
        try {
          let params = {
            ...temp,
            attributes: JSON.stringify(unref(classDataSchema).attributes),
          };
          if (props.detail) {
            params.id = props.detail.id;
          }
          if (temp.cuboidProperties) {
            params.cuboidProperties = JSON.stringify(temp.cuboidProperties);
          }
          await createEditClassApi(params);
          closeDrawer();
          classDataSchema.value = getInitClassData();
          emits('fetchList');
        } catch (e) {}
      },
      async () => {
        try {
          let params = {
            ...temp,
            attributes: JSON.stringify(unref(dataSchema).options),
          };
          if (props.detail) {
            params.id = props.detail.id;
          }
          await createEditClassApi(params);
          closeDrawer();
          dataSchema.value = getInitClassificationData();
          emits('fetchList');
        } catch (e) {}
      },
    );
  };
  const handleRemoveIndex = () => {
    unref(indexList).pop();
  };
  const handleDone = () => {
    emitter.emit('handleSaveForm');
    handleRemoveIndex();
  };
  const handleClose = () => {
    closeDrawer();
  };
  const handleCall = () => {
    emitter.emit('handleSubmitForm');
  };
  const handleDel = () => {
    if (activeTab.value === ClassTypeEnum.CLASS) {
      setClassSchema(classDataSchema, indexList.value, { setType: 'delete' });
    } else {
      setSchema(dataSchema, indexList.value, { setType: 'delete' });
    }
    unref(indexList).pop();
  };
</script>
<style lang="less" scoped>
  @import url('./index.less');
</style>
