/**
 * string
 */
import { v4 as uuid } from 'uuid';
import { nanoid } from 'nanoid';

// uuid
export function createUUID() {
  return uuid();
}
export function createTrackId() {
  return nanoid(16);
}
// formatId
export function formatId(...args: string[]) {
  return args.join('##');
}
// 'template { name }ddd'
// 'template { 0 }ddd'
export function template(str: string, args: Record<string, any> = {}) {
  const reg = /\{\s*(\w+)\s*\}/g;
  return str.replace(reg, (word: string, name: string) => {
    return args[name] || '';
  });
}
