import { FlowAction } from './enum';

export interface IPageHandler {
  init: () => void;
  onAction: (e: FlowAction, data?: any) => void;
}
