export const KEY_TOKEN = 'TOKEN__';

export default function useStorage() {
  const token = getStorageToken();

  return {
    token,
  };
}

export function getStorageToken() {
  const token = localStorage.getItem(KEY_TOKEN);
  return token || '';
}
