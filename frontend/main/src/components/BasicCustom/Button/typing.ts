import type { PropType } from 'vue';
import { CSSProperties } from 'vue';

export enum ButtonSize {
  SM = 'small',
  MD = 'middle',
  LG = 'large',
}

export const ButtonProps = {
  style: { type: Object as PropType<CSSProperties> },
  noBorder: { type: Boolean, default: false },
  gradient: { type: Boolean, default: false },
  size: { type: String as PropType<ButtonSize>, default: ButtonSize.MD },
  color: { type: String, validator: (v) => ['error', 'warning', 'success', ''].includes(v) },
  loading: { type: Boolean },
  disabled: { type: Boolean },
  /**
   * Text before icon.
   */
  preIcon: { type: String },
  /**
   * Text after icon.
   */
  postIcon: { type: String },
  /**
   * preIcon and postIcon icon size.
   * @default: 14
   */
  iconSize: { type: Number, default: 14 },
  onClick: { type: Function as PropType<(...args) => any>, default: null },
};
