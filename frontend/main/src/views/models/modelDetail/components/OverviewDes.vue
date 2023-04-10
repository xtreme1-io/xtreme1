<template>
  <div class="title"
    >{{ t('business.models.overviewPage.description') }}
    <div style="float: right">
      <template v-if="!isEdit">
        <SvgIcon
          style="color: #c4c4c4; cursor: pointer; border-radius: 6px; border: 2px solid #aaa"
          size="26"
          @click="handleEdit"
          name="edit"
        />
      </template>
      <template v-else>
        <Button type="default" @click="handleCancel">{{ t('common.cancelText') }}</Button>
        <Button type="primary" class="ml-2" @click="handleSave">{{ t('common.saveText') }}</Button>
      </template>
    </div>
  </div>

  <template v-if="!isEdit">
    <!-- eslint-disable vue/no-v-html -->
    <div v-if="showDescription" class="des_text" v-html="showDescription"></div>
    <Empty v-else />
  </template>
  <template v-else>
    <div class="mt-20px">
      <Tinymce v-model="description" width="100%" :plugins="plugins" :toolbar="toolbar" />
    </div>
  </template>
</template>
<script lang="ts" setup>
  import { Empty } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { SvgIcon } from '/@/components/Icon';
  import { Tinymce } from '/@/components/Tinymce';
  import { computed, ref, watch } from 'vue';
  import { Button } from '/@@/Button';
  import { editModelApi } from '/@/api/business/models';
  import { useRoute } from 'vue-router';
  import { message } from 'ant-design-vue';
  const plugins = [
    'advlist anchor autolink autosave code codesample  directionality  fullscreen hr insertdatetime link lists media nonbreaking noneditable pagebreak paste preview print save searchreplace spellchecker tabfocus  template  textpattern visualblocks visualchars wordcount',
  ];
  const toolbar = [
    'fontsizeselect bold italic underline strikethrough alignleft aligncenter alignright outdent indent  blockquote undo redo',
  ];
  const isEdit = ref(false);
  const { t } = useI18n();
  const props = withDefaults(defineProps<{ description: string | null }>(), {
    description: '',
  });

  let description = ref<string | null>('');
  let showDescription = ref<string | null>('');
  watch(
    () => props.description,
    (val) => {
      description.value = val;
      showDescription.value = val;
    },
  );

  const handleEdit = () => {
    isEdit.value = true;
  };
  const handleCancel = () => {
    isEdit.value = !isEdit.value;
  };
  const route = useRoute();
  const modelId = String(route?.query?.id);
  const handleSave = async () => {
    const params = {
      id: Number(modelId),
      description: description.value as string,
    };
    await editModelApi(params);
    isEdit.value = false;
    showDescription.value = description.value;
    message.success('Successed');
    // handleSuccess();
  };
</script>
<style lang="less" scoped>
  .overview {
    & > div {
      margin-right: 80px;
      margin-bottom: 30px;
      overflow: hidden;

      &:last-child {
        margin-bottom: 0;
      }

      .title {
        height: 25px;
        line-height: 25px;
        font-size: 18px;
        color: #000;
        margin-bottom: 20px;
      }
    }

    .des_text {
      // font-size: 14px;
      // line-height: 32px;
      // color: #333;
      // word-break: break-word;

      // width: 90%;
      margin-left: 20px;
      margin-bottom: 10px;
      padding: 20px;
      padding-right: 50px;
      background: #e6f7fd;
      border-radius: 20px;
    }
  }
</style>
