import { ClassTypeEnum } from '/@/api/business/model/classModel';
import {
  toolTypeList,
  toolTypeList3D,
} from '/@/views/datasets/datasetClass/components/formSchemas';
import tag from '/@/assets/images/class/tag.png';

export const imgFactory = (record) => {
  if (record.type === ClassTypeEnum.CLASSIFICATION) {
    return tag;
  }
  if (record.toolType) {
    console.log(toolTypeList.concat(toolTypeList3D));
    return toolTypeList.concat(toolTypeList3D).filter((item) => item.type === record.toolType)[0]
      ?.img;
  }
};
