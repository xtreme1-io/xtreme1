export const cardProps = {
  id: { type: String, required: true },
  handleSelected: { type: Function as PropType<(...args) => any>, default: null },
};
