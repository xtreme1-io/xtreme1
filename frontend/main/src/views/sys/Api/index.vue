<template>
  <div :class="`${prefixCls}`">
    <div>My Token</div>
    <div class="flex">
      <div class="w-520px whitespace-nowrap overflow-x-scroll mr-2">
        <span>{{ info?.token }}</span>
      </div>
      <Icon
        v-if="info?.token"
        icon="material-symbols:file-copy-rounded"
        @click="handleCopy"
        color="#CCCCCC"
      />
    </div>
    <div>Expiration Date</div>
    <div class="w-420px">
      <DatePicker v-model:value="date" />
    </div>
    <div> Go to our Documents to see how to use this token in APIs </div>
    <Button v-if="!info" type="primary" class="mr-2" @click="handleCreate">
      Generate a new token
    </Button>
    <Button v-else type="primary" danger @click="handleDelete">
      Delete and disable current token
    </Button>
  </div>
</template>
<script lang="ts" setup>
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { Button, DatePicker } from 'ant-design-vue';
  import Icon from '/@/components/Icon';
  import { onMounted, ref } from 'vue';
  import { createToken, deleteToken, getTokenInfo } from '/@/api/business/api';
  import moment from 'moment';
  const { prefixCls } = useDesign('api');
  const { t } = useI18n();
  const info = ref();
  const date = ref();
  onMounted(() => {
    getInfo();
  });

  const getInfo = async () => {
    info.value = await getTokenInfo();
  };

  const handleCreate = async () => {
    await createToken({
      expireAt: moment(date.value).utc().format(),
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
