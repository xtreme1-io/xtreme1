import { getStorageToken } from './useStorage';

export default function useToken() {
  let token = getStorageToken();
  token = token ? `Bearer ${token}` : '';

  return token;
}
