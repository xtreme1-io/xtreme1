<template>
  <BasicModal
    v-bind="$attrs"
    :visible="false"
    :okText="t('common.saveText')"
    @register="registerModal"
    destroyOnClose
    :width="560"
    :closable="false"
    :centered="true"
    wrapClassName="models_class_modal"
    @ok="saveHandle"
  >
    <template #title> classes Setting </template>
    <div class="inner">
      <div class="cursor-pointer">
        <Icon
          size="18"
          style="color: #60a9fe; margin-right: 10px"
          class="info-icon"
          icon="material-symbols:library-books-rounded"
        />
        <span style="color: #8bc1e8"
          >{{ t('business.models.helpLinkText.overviewClassSetting') }}
        </span>
      </div>
      <div class="text">
        <div class="title">
          <span class="code">
            code
            <Tooltip placement="rightTop" :title="codeText">
              <Icon size="15" class="info-icon" icon="uiw:information" /> </Tooltip
          ></span>
          <span class="name">
            name<Tooltip placement="rightTop" :title="nameText">
              <Icon size="15" class="info-icon" icon="uiw:information" /> </Tooltip></span
        ></div>
        <div class="classItem" :key="item.key" v-for="item in classConfig">
          <Input v-model:value="item.code" /> <Input v-model:value="item.name" />
          <div>
            <SvgIcon
              style="color: #c4c4c4; cursor: pointer"
              size="24"
              name="delete"
              @click="deleteClass(item)"
            />
          </div>
        </div>
        <div @click="addClass">
          <Icon icon="ant-design:plus-outlined" class="mt-1 cursor-pointer" size="29" />
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
  import Icon, { SvgIcon } from '/@/components/Icon';
  import { Button, Input, Tooltip } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import warningSvg from '/@/assets/images/models/warning.svg';
  import { ref } from 'vue';

  const { t } = useI18n();
  const [registerModal, { closeModal }] = useModalInner();
  const handleSave = () => {};

  let classConfig = ref<Array<any>>([]);

  const deleteClass = (item) => {
    classConfig.value = classConfig.value.filter((i) => i.key !== item.key);
  };
  const addClass = () => {
    classConfig.value.push({ key: Math.random(), code: '', name: '' });
  };
  const saveHandle = () => {
    // debugger;
  };
  const codeText = (
    <div style="width:300px;font-size: 12px">
      <div>Password must contain:</div>
      <ul style="padding-left: 15px;list-style: disc;">
        <li>8 and 64 characters</li>
        <li>Number</li>
        <li>Letter</li>
      </ul>
    </div>
  );
  const nameText = (
    <div style="width:300px;font-size: 12px">
      <div>Password must contain:</div>
      <ul style="padding-left: 15px;list-style: disc;">
        <li>8 and 64 characters</li>
        <li>Number</li>
        <li>Letter</li>
      </ul>
    </div>
  );
</script>
<style lang="less" scoped>
  .inner {
    .text {
      width: 100%;
      padding: 40px;
      font-weight: 500; //font-weight: 600;
      font-size: 16px;
      color: #333;
      .title {
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
      .classItem {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-bottom: 10px;
        :deep(.ant-input) {
          width: 200px;
          margin-right: 20px;
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
