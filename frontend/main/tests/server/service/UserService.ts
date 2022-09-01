import { Result } from '../utils';

const fakeUserInfo = {
  userId: '1',
  username: 'Author',
  realName: 'Author Admin',
  desc: 'manager',
  password: '123456',
  // token: 'fakeToken1',
  token:
    'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiaXNzIjoiYmFzaWMuYWkiLCJpYXQiOjE2NDYxODQ1MTUsImV4cCI6MTY0NjIyNzcxNX0.loE2fhfJr7uKN2i4cmnY_OtUCCEB5OHp4rpG3EkW4dWjMiXhOhW4tk8pPw1DiapFiDpiaSuFwT41sTRFO0ftIQ',
  roles: [
    {
      roleName: 'Super Admin',
      value: 'super',
    },
  ],
};
export default class UserService {
  async login() {
    return Result.success(fakeUserInfo);
  }

  async getUserInfoById() {
    return Result.success(fakeUserInfo);
  }
}
