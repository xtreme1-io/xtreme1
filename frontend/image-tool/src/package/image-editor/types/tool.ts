import { Component } from 'vue';
import { ToolName } from './enum';
import Editor from '../Editor';

export interface IToolItemConfig {
  action: ToolName;
  name: string;
  hotkey: number | string;
  title: string;
  order?: number;
  extraClass?: boolean;
  extra?: (editor: Editor) => Component;
  hasMsg?: (editor: Editor) => boolean;
  getIcon: (editor?: Editor) => ToolName | 'loading' | '';
  isDisplay: (editor: Editor) => boolean;
  isActive: (editor: Editor) => boolean;
}
