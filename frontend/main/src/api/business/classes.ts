import { defHttp } from '/@/utils/http/axios';
import {
  datasetClassificationItem,
  datasetClassificationResponse,
  datasetClassItem,
  datasetClassResponse,
  datasetSaveEditClassificationParams,
  datasetSaveEditClassParams,
  getAllDatasetParams,
  getAllOntologyParams,
  getDatasetClassesParams,
  getOntologyClassesParams,
  ontologyClassificationItem,
  ontologyClassificationResponse,
  ontologyClassItem,
  ontologyClassResponse,
  ontologySaveEditClassificationParams,
  ontologySaveEditClassParams,
  ValidateDatasetClassesNameParams,
  ValidateOntologyClassesNameParams,
  SyncParams,
  ICopyClassParams,
  ICopyClassificationParams,
} from './model/classesModel';
import { BasicIdParams } from '/@/api/model/baseModel';

enum Api {
  ONTOLOGY_CLASS = '/class',
  ONTOLOGY_CLASSIFICATION = '/classification',
  DATASET_CLASS = '/datasetClass',
  DATASET_CLASSIFICATION = '/datasetClassification',
}

/** Ontology Class */
/** get ontology class by ontologyId */
export const getOntologyClassApi = (params: getOntologyClassesParams) =>
  defHttp.get<ontologyClassResponse>({
    url: `${Api.ONTOLOGY_CLASS}/findByPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** create ontology ontology class */
export const createOntologyClassApi = (params: ontologySaveEditClassParams) =>
  defHttp.post<null>({
    url: `${Api.ONTOLOGY_CLASS}/create`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** update ontology ontology class */
export const updateOntologyClassApi = (params: ontologySaveEditClassParams) =>
  defHttp.post<null>({
    url: `${Api.ONTOLOGY_CLASS}/update/${params.id}`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** delete ontology class */
export const deleteOntologyClassApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.ONTOLOGY_CLASS}/delete/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get ontology class detail by id */
export const getOntologyClassByIdApi = (params: BasicIdParams) =>
  defHttp.get<ontologyClassItem>({
    url: `${Api.ONTOLOGY_CLASS}/info/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get ontology class by name */
export const getAllClassByOntologyIdApi = (params: getAllOntologyParams) =>
  defHttp.get<ontologyClassItem[]>({
    url: `${Api.ONTOLOGY_CLASS}/findAll/${params.ontologyId}`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** validate ontology class name */
export const validateOntologyClassNameApi = (params: ValidateOntologyClassesNameParams) =>
  defHttp.get<boolean>({
    url: `${Api.ONTOLOGY_CLASS}/validateName`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** push ontology class */
export const pushAttributesToDatasetApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.ONTOLOGY_CLASS}/pushAttributesToDataset/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

// ---------------------------------------

/** Ontology Classification */
/** get ontology classification by ontologyId */
export const getOntologyClassificationApi = (params: getOntologyClassesParams) =>
  defHttp.get<ontologyClassificationResponse>({
    url: `${Api.ONTOLOGY_CLASSIFICATION}/findByPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** create ontology classification */
export const createOntologyClassificationApi = (params: ontologySaveEditClassificationParams) =>
  defHttp.post<null>({
    url: `${Api.ONTOLOGY_CLASSIFICATION}/create`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** update ontology classification */
export const updateOntologyClassificationApi = (params: ontologySaveEditClassificationParams) =>
  defHttp.post<null>({
    url: `${Api.ONTOLOGY_CLASSIFICATION}/update/${params.id}`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** delete ontology classification */
export const deleteOntologyClassificationApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.ONTOLOGY_CLASSIFICATION}/delete/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get ontology classification detail by id */
export const getOntologyClassificationByIdApi = (params: BasicIdParams) =>
  defHttp.get<ontologyClassificationItem>({
    url: `${Api.ONTOLOGY_CLASSIFICATION}/info/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** validate ontology classification name */
export const validateOntologyClassificationNameApi = (params: ValidateOntologyClassesNameParams) =>
  defHttp.get<boolean>({
    url: `${Api.ONTOLOGY_CLASSIFICATION}/validateName`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

// ---------------------------------------

/** Dataset Class */

/** get dataset class by datasetId */
export const getDatasetClassApi = (params: getDatasetClassesParams) =>
  defHttp.get<datasetClassResponse>({
    url: `${Api.DATASET_CLASS}/findByPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** create dataset class */
export const createDatasetClassApi = (params: datasetSaveEditClassParams) =>
  defHttp.post<null>({
    url: `${Api.DATASET_CLASS}/create`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** update dataset class */
export const updateDatasetClassApi = (params: datasetSaveEditClassParams) =>
  defHttp.post<null>({
    url: `${Api.DATASET_CLASS}/update/${params.id}`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** delete dataset class */
export const deleteDatasetClassApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.DATASET_CLASS}/delete/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** delete dataset class batch */
export const deleteSelectedDatasetClassApi = (params: Array<BasicIdParams>) =>
  defHttp.post<null>({
    url: `${Api.DATASET_CLASS}/deleteByIds`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get dataset class detail by id */
export const getDatasetClassByIdApi = (params: BasicIdParams) =>
  defHttp.get<datasetClassItem>({
    url: `${Api.DATASET_CLASS}/info/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get dataset class by name */
export const getDatasetClassByNameApi = (params: { ontologyId: string; name?: string }) =>
  defHttp.get<any>({
    url: `${Api.DATASET_CLASS}/find/${params.ontologyId}?&`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** validate dataset class name */
export const validateDatasetClassNameApi = (params: ValidateDatasetClassesNameParams) =>
  defHttp.get<boolean>({
    url: `${Api.DATASET_CLASS}/validateName`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** Get All Dataset Class */
export const getDatasetAllClass = (params: getAllDatasetParams) =>
  defHttp.get<datasetClassResponse>({
    url: `${Api.DATASET_CLASS}/find`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** copy class from ontology */
export const copyClassFromOntologyApi = (params: ICopyClassParams) =>
  defHttp.post<null>({
    url: `${Api.DATASET_CLASS}/copyFromOntologyCenter`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** save class to ontology */
export const saveClassToOntologyApi = (params: ICopyClassParams) =>
  defHttp.post<null>({
    url: `${Api.DATASET_CLASS}/saveToOntologyCenter`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

// ---------------------------------------

/** Dataset Classification */

/** get dataset classification by datasetId */
export const getDatasetClassificationApi = (params: getDatasetClassesParams) =>
  defHttp.get<datasetClassificationResponse>({
    url: `${Api.DATASET_CLASSIFICATION}/findByPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get dataset classification by name */
export const getDatasetClassificationAllApi = (params: { datasetId: string }) =>
  defHttp.get<any>({
    url: `${Api.DATASET_CLASSIFICATION}/findAll/${params.datasetId}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** create dataset classification */
export const createDatasetClassificationApi = (params: datasetSaveEditClassificationParams) =>
  defHttp.post<null>({
    url: `${Api.DATASET_CLASSIFICATION}/create`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** update dataset classification */
export const updateDatasetClassificationApi = (params: datasetSaveEditClassificationParams) =>
  defHttp.post<null>({
    url: `${Api.DATASET_CLASSIFICATION}/update/${params.id}`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** delete dataset classification */
export const deleteDatasetClassificationApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.DATASET_CLASSIFICATION}/delete/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** delete dataset classification batch */
export const deleteSelectedDatasetClassificationApi = (params: Array<BasicIdParams>) =>
  defHttp.post<null>({
    url: `${Api.DATASET_CLASSIFICATION}/deleteByIds`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get dataset classification detail by id */
export const getDatasetClassificationByIdApi = (params: BasicIdParams) =>
  defHttp.get<datasetClassificationItem>({
    url: `${Api.DATASET_CLASSIFICATION}/info/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** validate datasetClassification name */
export const validateDatasetClassificationNameApi = (params: ValidateDatasetClassesNameParams) =>
  defHttp.get<boolean>({
    url: `${Api.DATASET_CLASSIFICATION}/validateName`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** copy classification from ontology */
export const copyClassificationFromOntologyApi = (params: ICopyClassificationParams) =>
  defHttp.post<null>({
    url: `${Api.DATASET_CLASSIFICATION}/copyFromOntologyCenter`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** save class to ontology */
export const saveClassificationToOntologyApi = (params: ICopyClassificationParams) =>
  defHttp.post<null>({
    url: `${Api.DATASET_CLASSIFICATION}/saveToOntologyCenter`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** ------------------------------- */
/** get dataset classification by name */
export const getDatasetClassificationByNameApi = (params: { ontologyId: string; name?: string }) =>
  defHttp.get<any>({
    url: `${Api.DATASET_CLASSIFICATION}/find/${params.ontologyId}?&`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** sync datasetClass to ontology */
export const syncDatasetClassToOntologyApi = (params: SyncParams) =>
  defHttp.post<null>({
    url: `${Api.DATASET_CLASS}/synchronizeToOntology`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
/** sync datasetClassification to ontology */
export const syncDatasetClassificationToOntologyApi = (params: SyncParams) =>
  defHttp.post<null>({
    url: `${Api.DATASET_CLASSIFICATION}/synchronizeToOntology`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
