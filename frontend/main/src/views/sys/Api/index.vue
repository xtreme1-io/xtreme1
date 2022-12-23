<template>
  <div :class="`${prefixCls}`">
    <div class="mb-2 font-bold">My Token</div>
    <div class="flex">
      <div class="w-420px whitespace-nowrap overflow-x-scroll mr-2">
        <span>{{ info?.token }}</span>
      </div>
      <Icon
        v-if="info?.token"
        icon="material-symbols:file-copy-rounded"
        @click="handleCopy"
        color="#CCCCCC"
      />
    </div>
    <template v-if="!info">
      <div class="mt-2 mb-2 font-bold">Expiration Date</div>
      <div class="flex items-center">
        <div class="w-420px mr-2" v-if="!isNever">
          <DatePicker style="width: 100%" v-model:value="date" :disabledDate="disabledDate" />
        </div>
        <div>
          <Checkbox v-model:checked="isNever" />
          <span class="ml-2">Never Expire</span>
        </div>
      </div>
    </template>
    <div class="mb-2 mt-2 cursor-pointer" @click="handleOpen">
      Go to our Documents to see how to use this token in APIs
      <Icon icon="ic:sharp-open-in-new" />
    </div>
    <Button v-if="!info" type="primary" class="mr-2" @click="handleCreate">
      Generate a new token
    </Button>
    <Button v-else type="primary" danger @click="handleDelete">
      Delete and disable current token
    </Button>
  </div>
</template>
<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import { Button, DatePicker, Checkbox, message } from 'ant-design-vue';
  import Icon from '/@/components/Icon';
  import { onMounted, ref, unref } from 'vue';
  import { createToken, deleteToken, getTokenInfo } from '/@/api/business/api';
  import moment, { Moment } from 'moment';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { openWindow } from '/@/utils';
  const { prefixCls } = useDesign('api');
  // const { t } = useI18n();
  const info = ref();
  const date = ref();
  const isNever = ref();
  onMounted(() => {
    getInfo();
  });

  const getInfo = async () => {
    info.value = await getTokenInfo();
  };

  const disabledDate = (current: Moment) => {
    return current < moment(new Date());
  };

  const handleCreate = async () => {
    if (!isNever.value && !date.value) {
      return message.error('please select Expiration Date');
    }
    let expireAt: any = moment(date.value).utc().format();
    if (isNever.value) {
      expireAt = null;
    }
    await createToken({
      expireAt: expireAt,
    });
    getInfo();
  };

  function handleCopy() {
    const { isSuccessRef } = useCopyToClipboard(info.value?.token || '');
    unref(isSuccessRef) &&
      message.success({
        content: 'successfully copied to clipboard',
        duration: 5,
      });
  }

  const handleDelete = async () => {
    await deleteToken({ id: info.value.id });
    getInfo();
  };

  const handleOpen = () => {
    openWindow('https://docs.xtreme1.io/xtreme1-docs/developer-reference/api-document');
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-api';
  .@{prefix-cls} {
    height: 100vh;
    background: #fff;
    color: #333;
    padding: 40px;
  }
</style>
