import { parseClassesFromBackend, traverseClassification2Arr } from '../utils';
import { get } from './base';
import { Api } from './type';

/** all class */
export async function getDataflowClass(datasetId: string) {
  const url = `${Api.API}/datasetClass/findAll/${datasetId}`;
  let data = await get(url);
  data = data.data || [];

  const classTypes = parseClassesFromBackend(data);

  return classTypes;
}
/** all Classification */
export async function getDataflowClassification(datasetId: string) {
  const url = `${Api.API}/datasetClassification/findAll/${datasetId}`;
  let data = await get(url);
  data = data.data || [];
  const classifications = traverseClassification2Arr(data);
  console.log('classifications', classifications);

  return classifications;
}
