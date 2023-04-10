<template>
  <div :class="prefixCls">
    <div class="h-50px flex items-center px-20px gap-4px cursor-pointer" @click="handleGoBack">
      <Icon icon="eva:arrow-back-fill" size="14" color="#60A9FE" />
      <span style="color: #60a9fe">Back</span>
    </div>
    <div class="w-780px flex gap-80px py-45px px-60px relative" v-loading="isUpdating">
      <div class="flex flex-col items-center gap-10px">
        <ProfileAvatar
          :avatarUrl="userInfo?.avatarUrl"
          :nickname="(userInfo?.nickname as string)"
        />
        <Upload :customRequest="handleUpload" :showUploadList="false">
          <div class="edit-btn text-primary cursor-pointer">{{ t('common.editText') }}</div>
        </Upload>
      </div>
      <div class="w-420px">
        <div class="form-item">
          <div class="label required">Name</div>
          <InnerEdit :editValue="(userInfo?.nickname as string)" @save="handleSaveName" />
        </div>
        <div class="form-item">
          <div class="label">Email</div>
          <div class="input disabled">{{ userInfo?.email }}</div>
        </div>
        <Password
          ref="passwordRef"
          :hasPassword="(userInfo?.hasPassword as boolean)"
          @submit="handleSavePassword"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, onMounted, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { getBufferWithFile } from '/@/components/Upload/src/helper';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';

  import { Upload } from 'ant-design-vue';
  import { Icon } from '/@/components/Icon';
  import { InnerEdit } from '/@@/InnerEdit';
  import { ProfileAvatar } from '/@@/ProfileAvatar';
  // import headerImg from '/@/assets/images/common/default-ava.png';
  // import { Button } from '/@@/Button';
  // import PwdLabelInfo from './components/PwdLabelInfo.vue';
  import Password from './components/Password.vue';

  import { updateUser, uploadAvatar } from '/@/api/sys/user';
  // import { uploadApi } from '/@/api/sys/upload';
  // import { UploadFileEnum } from '/@/api/business/model/datasetModel';
  // import { User } from '/@/api/sys/model/userModel';

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const { prefixCls } = useDesign('profile');
  const userStore = useUserStore();

  const router = useRouter();
  const handleGoBack = () => {
    router.back();
  };

  // const { createMessage } = useMessage();

  const userInfo = reactive({
    nickname: '',
    email: '',
    avatarUrl: '',
    hasPassword: false,
    avatarId: '',
  });
  onMounted(async () => {
    setCurrentUserInfo();
  });
  const setCurrentUserInfo = () => {
    const { nickname, username, avatarUrl, avatarId } = userStore.getUserInfo as any;
    userInfo.nickname = nickname;
    userInfo.email = username;
    userInfo.avatarUrl = avatarUrl;
    userInfo.avatarId = avatarId;
  };

  /** Avatar */
  function handleUpload(files) {
    const { file } = files;
    const imageType = ['image/jpeg', 'image/png'];
    const isImage = imageType.includes(file.type);
    if (!isImage) {
      return createMessage.error('You can only upload jpg/jpeg/png file!');
    }
    const upload = async ({ file: resultImg }) => {
      try {
        const res: any = await uploadAvatar({
          file: resultImg,
        });
        // return;
        const params = {
          avatarId: res.data,
        };
        handleUpdateUser(params);
      } catch (_) {}
    };
    getBufferWithFile(file).then(upload);
  }

  /** Nickname */
  const handleSaveName = (newValue: string) => {
    const params = {
      nickname: newValue,
    };
    handleUpdateUser(params);
  };

  /** Password */
  const passwordRef = ref();
  const handleSavePassword = async (data) => {
    const params = {
      ...data,
    };
    const res = await handleUpdateUser(params);
    if (res) {
      passwordRef.value.handleCancel();
    }
  };

  /** Update */
  const isUpdating = ref<boolean>(false);
  const handleUpdateUser = async (params) => {
    try {
      isUpdating.value = true;

      const res = await updateUser({
        ...params,
      });
      createMessage.success('Update Success!');

      // Update Store
      userStore.setUserInfo(res);

      setCurrentUserInfo();

      isUpdating.value = false;
      return true;
    } catch (e) {
      isUpdating.value = false;
      return false;
    }
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-profile';
  .@{prefix-cls} {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: white;

    .form-item {
      width: 420px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;

      .label {
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        color: #333333;

        &.required {
          &::before {
            content: '*';
            position: relative;
            display: inline-block;
            color: #f8827b;
            margin-right: 5px;
          }
        }
      }

      .input {
        height: 36px;
        line-height: 36px;
        padding: 0px 10px;
        border-radius: 4px;
        background-color: #fff;
        border: 1px solid #ccc;

        font-size: 14px;
        color: #333;

        &.disabled {
          color: #666;
          background-color: #f5f5f5;
          cursor: not-allowed;
        }
      }

      :deep(.inner__edit) {
        width: 560px;

        &--value {
          width: 420px;
          font-size: 14px;
          color: #333;
          height: 36px;
          line-height: 36px;
          padding: 0px 10px;
          border-radius: 4px;
          border: 1px solid #ccc;
          justify-content: space-between;
        }

        &--input {
          & > div {
            width: 420px;
          }
        }
      }
    }
  }
</style>
