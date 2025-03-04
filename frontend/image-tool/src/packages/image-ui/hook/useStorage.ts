export const KEY_EDITCLASS = 'edit-class-modal';

export default function useStorage() {}

export function getStorageEditclass() {
  const sizeStyle = localStorage.getItem(KEY_EDITCLASS);
  return sizeStyle || '';
}
export function setStorageEditclass(style: string) {
  localStorage.setItem(KEY_EDITCLASS, style);
}
