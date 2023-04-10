<template>
  <BasicModal
    v-bind="$attrs"
    :okText="t('common.saveText')"
    @register="registerModal"
    destroyOnClose
    :width="550"
    :closable="false"
    :centered="true"
    wrapClassName="models_class_modal"
    @ok="saveHandle"
  >
    <template #title>
      classes Setting
      <a class="cursor-pointer link">
        <Icon
          size="18"
          style="color: #60a9fe; margin-right: 10px"
          class="info-icon"
          icon="material-symbols:library-books-rounded"
        />
        <span style="color: #8bc1e8"
          >{{ t('business.models.helpLinkText.overviewClassSetting') }}
        </span>
      </a>
    </template>
    <div class="inner">
      <div class="text">
        <div class="title">
          <span class="code">
            code
            <Tooltip placement="rightTop" :title="t('business.models.overView.codeText')">
              <Icon size="15" class="info-icon" icon="uiw:information" /> </Tooltip
          ></span>
          <span class="name">
            name
            <Tooltip placement="rightTop" :title="t('business.models.overView.nameText')">
              <Icon size="15" class="info-icon" icon="uiw:information" /> </Tooltip></span
        ></div>
        <div class="items">
          <div class="classItem" :key="item.key" v-for="item in classConfig">
            <div>
              <Input v-model:value="item.code" /><div v-show="!item.code" class="errortip">
                {{ t('business.models.overView.codeErrorMsg') }}
              </div>
            </div>
            <div>
              <Input v-model:value="item.name" /><div v-show="!item.name" class="errortip">
                {{ t('business.models.overView.nameErrorMsg') }}</div
              >
            </div>

            <div>
              <SvgIcon
                style="color: #c4c4c4; cursor: pointer"
                size="24"
                name="delete"
                @click="deleteClass(item)"
              />
            </div>
          </div>
        </div>

        <div style="width: 80px; color: #576ff3" class="mt-1 cursor-pointer" @click="addClass">
          <Icon icon="ant-design:plus-outlined" size="18" /> Add
        </div>
      </div>
      <!-- <div class="btn">
        <Button type="default" @click="closeModal">{{ t('common.cancelText') }}</Button>
        <Button type="primary" class="ml-2" @click="handleSave">{{ t('common.saveText') }}</Button>
      </div> -->
    </div>
  </BasicModal>
</template>

<script lang="tsx" setup>
  import { setClassModelApi } from '/@/api/business/models';

  import Icon, { SvgIcon } from '/@/components/Icon';
  import { Button, Input, message, Tooltip } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import warningSvg from '/@/assets/images/models/warning.svg';
  import { inject, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { modelClassList } from '/@/api/business/model/modelsModel';
  import { string } from 'vue-types';

  let props = defineProps<{ classes: Array<any> }>();
  const { t } = useI18n();
  const [registerModal, { closeModal }] = useModalInner();

  interface ClassParams extends modelClassList {
    key: string | number;
  }

  let classConfig = ref<Array<ClassParams>>([]);

  watch(
    () => props.classes,
    (val) => {
      if (val) {
        let copydata = JSON.parse(JSON.stringify(val));
        classConfig.value = copydata.map((item) => {
          return { ...item, key: Math.random() };
        });
      }
    },
    {
      immediate: true,
    },
  );

  const deleteClass = (item) => {
    classConfig.value = classConfig.value.filter((i) => i.key !== item.key);
  };
  const addClass = () => {
    classConfig.value.push({ key: Math.random(), code: '', name: '' });
  };
  const route = useRoute();
  const modelId = String(route?.query?.id);

  const refreshListFn: Function | undefined = inject('refreshList');
  const saveHandle = async () => {
    const params: any = {
      modelId: Number(modelId),
    };
    let validate = false;
    params.modelClassList = classConfig.value.map((item) => {
      if (!item.code || !item.name) {
        validate = true;
      }
      return {
        code: item.code,
        name: item.name,
      };
    });
    if (validate) {
      return;
    }
    await setClassModelApi(params);
    message.success('Successed');
    closeModal();
    refreshListFn && refreshListFn();
  };
  // const codeText = (
  //   <div style="width:300px;font-size: 12px">
  //     <div>the code of your classes correspond to the 'label' values by your model runs</div>
  //   </div>
  // );
</script>
<style lang="less" scoped>
  .link {
    margin-left: 10px;
    display: inline-block;
    padding: 3px 4px;
    background: #edf0ff;
    border-radius: 4px;
    span {
      font-size: 12px;
    }
  }
  .inner {
    .text {
      width: 100%;
      padding: 20px;
      font-weight: 500; //font-weight: 600;
      font-size: 16px;
      color: #333;
      .title {
        margin-bottom: 10px;
        .code {
          display: inline-block;
          width: 200px;
          margin-right: 10px;
        }
        .name {
          display: inline-block;
          width: 200px;
        }
      }
      .items {
        max-height: 310px;
        overflow: auto;
        .classItem {
          display: flex;
          justify-content: flex-start;

          margin-bottom: 10px;
          :deep(.ant-input) {
            width: 200px;
            margin-right: 20px;
          }
          .errortip {
            font-size: 12px;
            color: red;
          }
        }
      }
    }

    .btn {
      position: relative;
      top: -25px;
      left: -10px;
      text-align: right;

      button {
        width: 70px;
        height: 36px;
        border-radius: 6px;
      }
    }
  }
</style>

<style lang="less">
  .models_class_modal {
    .scrollbar__wrap {
      // overflow: hidden;
    }

    .scrollbar__bar {
      // display: none;
    }

    .ant-modal-body {
      height: 450px;
    }
  }
</style>
