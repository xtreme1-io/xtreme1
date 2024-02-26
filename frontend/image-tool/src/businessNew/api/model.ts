import { IModel, IModelClass } from 'image-editor';
import { get, post } from './base';
import { Api } from './type';
/**
 * model
 */
export async function getModelList() {
  const url = `${Api.API}/model/list`;
  const res = await get(url);
  const data = res.data || [];

  const models = [] as IModel[];
  data.forEach((e: any) => {
    if (e.datasetType !== 'IMAGE') return;
    let classes = (e.classes || []) as IModelClass[];
    //  COCO subClass
    classes = classes
      .map((item) => {
        return item.subClasses || item;
      })
      .flat(1)
      .map((e: any) => {
        return { ...e, label: e.name, value: e.code };
      });
    models.push({
      id: e.id + '',
      name: e.name,
      version: e.version,
      code: e.modelCode,
      classes,
      isInteractive: e.isInteractive,
      type: e.type,
    });
  });

  return models;
}

export async function getModelResult(dataIds: string[], recordId: string) {
  const url = `${Api.DATA}/modelAnnotationResult`;
  const args: string[] = [];
  dataIds.forEach((e) => args.push(`dataIds=${e}`));
  args.push(`serialNo=${recordId}`);
  return await get(`${url}?${args.join('&')}`);
}
export async function clearModel(dataIds: number[], recordId: string) {
  let url = `/api/data/removeModelDataResult`;
  let data = await post(url, { serialNo: recordId, dataIds });
}
export async function runModel(config: any) {
  const url = `${Api.DATA}/modelAnnotate`;
  return await post(url, config);
}
