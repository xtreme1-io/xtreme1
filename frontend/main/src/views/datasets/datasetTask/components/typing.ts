export enum StageType {
  Annotate,
  Review,
}

export type Item = {
  id: number;
  type: StageType;
  user: any[];
};
