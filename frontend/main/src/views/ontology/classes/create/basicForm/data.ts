// Import image
import polygon from '/@/assets/images/class/polygon.png';
import bounding_box from '/@/assets/images/class/bounding_box.png';
import polyline from '/@/assets/images/class/polyline.png';
import key_point from '/@/assets/images/class/key_point.png';
import cuboid from '/@/assets/images/class/cuboid.png';
import radioIcon from '/@/assets/images/class/radio_icon.png';
import checkIcon from '/@/assets/images/class/check_icon.png';
import dropdownIcon from '/@/assets/images/class/dropdown_icon.png';
import textIcon from '/@/assets/images/class/text_icon.png';

import { useI18n } from '/@/hooks/web/useI18n';
import { SortTypeEnum } from '/@/api/model/baseModel';
import {
  SortFieldEnum,
  datasetTypeEnum,
  ToolTypeEnum,
  inputTypeEnum,
} from '/@/api/business/model/ontologyClassesModel';
import { RuleObject } from 'ant-design-vue/es/form/interface';

const { t } = useI18n();

/** Sort field */
export const dataSortOption = [
  {
    label: t('business.ontology.sort.creationTime'),
    value: SortFieldEnum.CREATE_TIME,
  },
  {
    label: t('business.ontology.sort.name'),
    value: SortFieldEnum.NAME,
  },
];

/** Forward order reverse order */
export const SortTypeOption = [
  {
    label: t('common.sort.Asc'),
    value: SortTypeEnum.ASC,
  },
  {
    label: t('common.sort.Desc'),
    value: SortTypeEnum.DESC,
  },
];

/** color list */
export const colorOption = [
  '#7dfaf2',
  '#7ff0b3',
  '#a4fc8e',
  '#d3f868',
  '#faef2c',
  '#fcb17a',
  '#f87d7d',
  '#c18af7',
  '#de7ef6',
  '#8177f5',
];

/** datasetType list */
export const datasetTypeList = [
  {
    value: datasetTypeEnum.LIDAR_BASIC,
    label: t('business.ontology.modal.datasetType.lidarBasic'),
  },
  {
    value: datasetTypeEnum.LIDAR_FUSION,
    label: t('business.ontology.modal.datasetType.lidarFusion'),
  },
  {
    value: datasetTypeEnum.IMAGE,
    label: t('business.ontology.modal.datasetType.image'),
  },
];

/** toolType img */
export const toolTypeImg = {
  POLYGON: polygon,
  BOUNDING_BOX: bounding_box,
  POLYLINE: polyline,
  KEY_POINT: key_point,
  CUBOID: cuboid,
};

/** toolType list */
export const toolTypeList = [
  {
    id: 1,
    img: bounding_box,
    type: ToolTypeEnum.BOUNDING_BOX,
    text: t('business.ontology.modal.toolType.boundingBox'),
  },
  {
    id: 2,
    img: polygon,
    type: ToolTypeEnum.POLYGON,
    text: t('business.ontology.modal.toolType.polygon'),
  },
  {
    id: 3,
    img: polyline,
    type: ToolTypeEnum.POLYLINE,
    text: t('business.ontology.modal.toolType.polyline'),
  },
  {
    id: 4,
    img: key_point,
    type: ToolTypeEnum.KEY_POINT,
    text: t('business.ontology.modal.toolType.keyPoint'),
  },
  {
    id: 5,
    img: cuboid,
    type: ToolTypeEnum.CUBOID,
    text: t('business.ontology.modal.toolType.cuboid'),
  },
];

/** inputType img */
export const inputItemImg = {
  RADIO: radioIcon,
  MULTI_SELECTION: checkIcon,
  DROPDOWN: dropdownIcon,
  TEXT: textIcon,
};
export const inputTypeList: Array<{
  label: string;
  img: string;
  value: string;
  key: string;
}> = getOption();
function getOption() {
  const options: any[] = [];
  for (const key in inputTypeEnum) {
    options.push({
      label: key,
      img: inputItemImg[key],
      value: inputTypeEnum[key],
      key: key,
    });
  }
  return options;
}

/** image constraints type */
export enum imageConstraintsEnum {
  SIZE = 'SIZE',
  AREA = 'AREA',
}

/** Validate Name */
export const validateName = async (_rule: RuleObject, value: string) => {
  if (!value) {
    return Promise.reject(t('business.ontology.modal.nameRequired'));
  } else {
    return Promise.resolve();
  }
  // if (!value) {
  //   return Promise.reject(t('business.ontology.modal.nameRequired'));
  // } else {
  //   // OntologyCenter | DatasetOntology
  //   if (value === baseFormName.value) {
  //     // name has not changed, no duplicate name verification
  //     return Promise.resolve();
  //   }

  //   const params: ValidateNameParams = {
  //     name: formState.name ?? '',
  //     datasetId: props.datasetId as number,
  //   };
  //   if (props.activeTab == ClassTypeEnum.CLASS) {
  //     try {
  //       const res = await validateClassNameApi(params);
  //       if (!res) {
  //         afterValid(true, value);
  //         return Promise.resolve();
  //       } else {
  //         emits('valid', true);
  //         const text =
  //           t('business.class.class') +
  //           ` "${params.name}" ` +
  //           t('business.ontology.modal.alreadyExits') +
  //           t('business.ontology.modal.enterNewName');
  //         return Promise.reject(text);
  //       }
  //     } catch {}
  //   } else {
  //     try {
  //       const res = await validateClassificationNameApi(params);
  //       if (!res) {
  //         afterValid(true, value);
  //         return Promise.resolve();
  //       } else {
  //         emits('valid', true);
  //         const text =
  //           t('business.class.classification') +
  //           ` "${params.name}" ` +
  //           t('business.ontology.modal.alreadyExits') +
  //           t('business.ontology.modal.enterNewName');
  //         return Promise.reject(text);
  //       }
  //     } catch {}
  //   }
  // }
};
