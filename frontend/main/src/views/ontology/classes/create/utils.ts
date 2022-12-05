import { v4 } from 'uuid';

export const handleAddUuid = (list: any) => {
  list.forEach((item) => {
    item.uuid = item.uuid ?? v4();
    handleAddUuid(item.options ?? item.attributes);
  });
};
