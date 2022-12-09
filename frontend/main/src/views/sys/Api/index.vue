<template>
  <div :class="`${prefixCls}`">
    <div>My Token</div>
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
      <div>Expiration Date</div>
      <div class="flex items-center">
        <div class="w-420px">
          <DatePicker style="width: 100%" v-model:value="date" />
        </div>
        <div class="ml-2"> <Checkbox v-model:checked="isNever" />Never Expire </div>
      </div>
    </template>
    <div>
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
  // import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { Button, DatePicker, Checkbox, message } from 'ant-design-vue';
  import Icon from '/@/components/Icon';
  import { onMounted, ref } from 'vue';
  import { createToken, deleteToken, getTokenInfo } from '/@/api/business/api';
  import moment from 'moment';
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

  const handleCopy = async () => {};

  const handleDelete = async () => {
    await deleteToken({ id: info.value.id });
    getInfo();
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-api';
  .@{prefix-cls} {
    background: #fff;
    color: #333;
    padding: 40px;
  }
</style>
