import type { ErrorMessageMode } from '/#/axios';
import { defineStore } from 'pinia';
import { store } from '/@/store';
// import { RoleEnum } from '/@/enums/roleEnum';
import { PageEnum } from '/@/enums/pageEnum';
import { ROLES_KEY, TOKEN_KEY, USER_INFO_KEY } from '/@/enums/cacheEnum';
import { getAuthCache, setAuthCache } from '/@/utils/auth';
import { GetUserInfoModel, LoginParams } from '/@/api/sys/model/userModel';
import { doLogout, getUserInfo, loginApi } from '/@/api/sys/user';
import { useI18n } from '/@/hooks/web/useI18n';
import { useMessage } from '/@/hooks/web/useMessage';
import { router } from '/@/router';
import { usePermissionStore } from '/@/store/modules/permission';
import { RouteRecordRaw } from 'vue-router';
import { PAGE_NOT_FOUND_ROUTE } from '/@/router/routes/basic';
// import { isArray } from '/@/utils/is';
import { h } from 'vue';
import { Role } from '/@/api/business/model/teamModel';

interface TempInfo {
  id: number;
  name: string;
  inviteCode: string;
}

interface UserState {
  userInfo: Nullable<GetUserInfoModel>;
  token?: string;
  roleList: Role[];
  sessionTimeout?: boolean;
  lastUpdateTime: number;
  tempInfo: TempInfo;
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): UserState => ({
    // user info
    userInfo: null,
    // token
    token: undefined,
    // roleList
    roleList: [],
    // Whether the login expired
    sessionTimeout: false,
    // Last fetch time
    lastUpdateTime: 0,
    tempInfo: {
      name: '',
      id: 0,
      inviteCode: '',
    },
  }),
  getters: {
    getUserInfo(): Nullable<GetUserInfoModel> {
      return this.userInfo || getAuthCache<any>(USER_INFO_KEY) || null;
    },
    getToken(): string {
      return this.token || getAuthCache<string>(TOKEN_KEY);
    },
    getRoleList(): Role[] {
      return this.roleList.length > 0 ? this.roleList : getAuthCache<Role[]>(ROLES_KEY);
    },
    getSessionTimeout(): boolean {
      return !!this.sessionTimeout;
    },
    getLastUpdateTime(): number {
      return this.lastUpdateTime;
    },
    getTempInfo(): TempInfo {
      return this.tempInfo;
    },
  },
  actions: {
    setTempInfo(info) {
      this.tempInfo = info;
    },
    setToken(info: string | undefined) {
      this.token = info ? info : ''; // for null or undefined value
      window.document.cookie = `${document.domain} token=${info};domain=${document.domain};expires=Fri, 31 Dec 9999 23:59:59 GMT`;
      setAuthCache(TOKEN_KEY, info);
    },
    setRoleList(roleList: Role[]) {
      this.roleList = roleList;
      setAuthCache(ROLES_KEY, roleList);
    },
    setUserInfo(info: GetUserInfoModel | null) {
      this.userInfo = info;
      this.lastUpdateTime = new Date().getTime();
      setAuthCache(USER_INFO_KEY, info);
      window.document.cookie = `${document.domain} token=${this.getToken};domain=${document.domain};expires=Fri, 31 Dec 9999 23:59:59 GMT`;
    },
    setSessionTimeout(flag: boolean) {
      this.sessionTimeout = flag;
    },
    resetState() {
      this.userInfo = null;
      this.token = '';
      this.roleList = [];
      this.sessionTimeout = false;
    },
    /**
     * @description: login
     */
    async login(
      params: LoginParams & {
        goHome?: boolean;
        mode?: ErrorMessageMode;
      },
    ): Promise<GetUserInfoModel | null> {
      try {
        const { goHome = true, mode, ...loginParams } = params;
        const data = await loginApi(loginParams, mode);
        const { token } = data;

        // save token

        this.setToken(token);
        return this.afterLoginAction(goHome);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async afterLoginAction(goHome?: boolean): Promise<GetUserInfoModel | null> {
      if (!this.getToken) return null;
      // get user info
      const userInfo = await this.getUserInfoAction();
      // if (!userInfo?.team) {
      //   const res = await fetchUser({ id: userInfo?.user?.id || 0 });
      //   if (
      //     (res.teams && res.teams[0].status == TeamStatusEnum.JOINING) ||
      //     (res.teams && res.teams[0].status == TeamStatusEnum.PENDING)
      //   ) {
      //     setLoginState(LoginStateEnum.JOIN_TEAM_FEED);
      //     return null;
      //   }
      //   router.push(PageEnum.BASE_LOGIN);
      //   setLoginState(LoginStateEnum.TEAM_BRIDGE);
      // }
      const sessionTimeout = this.sessionTimeout;
      if (sessionTimeout) {
        this.setSessionTimeout(false);
      } else {
        const permissionStore = usePermissionStore();
        // await permissionStore.changePermissionCode();
        // console.log(permissionStore, !permissionStore.isDynamicAddedRoute);
        // if (!permissionStore.isDynamicAddedRoute) {
        const routes = await permissionStore.buildRoutesAction();
        routes.forEach((route) => {
          router.addRoute(route as unknown as RouteRecordRaw);
        });
        router.addRoute(PAGE_NOT_FOUND_ROUTE as unknown as RouteRecordRaw);
        // }
        goHome && (await router.replace(PageEnum.BASE_HOME));
      }
      return userInfo;
    },
    async getUserInfoAction(): Promise<GetUserInfoModel | null> {
      if (!this.getToken) return null;
      const userInfo = await getUserInfo();
      this.setUserInfo(userInfo);

      return userInfo;
    },
    /**
     * @description: logout
     */
    async logout(goLogin = false) {
      if (this.getToken) {
        try {
          await doLogout();
        } catch {
          console.log('注销Token失败');
        }
      }
      this.setToken(undefined);
      this.setSessionTimeout(false);
      this.setUserInfo(null);
      goLogin && router.push(PageEnum.BASE_LOGIN);
    },

    /**
     * @description: Confirm before logging out
     */
    confirmLoginOut() {
      const { createConfirm } = useMessage();
      const { t } = useI18n();
      createConfirm({
        iconType: 'warning',
        title: () => h('span', t('sys.app.logoutTip')),
        content: () => h('span', t('sys.app.logoutMessage')),
        onOk: async () => {
          await this.logout(true);
        },
      });
    },
  },
});

// Need to be used outside the setup
export function useUserStoreWithOut() {
  return useUserStore(store);
}
