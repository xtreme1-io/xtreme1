import { IClassification } from './class';
import { IDoing } from './common';
import { ITeam, IUser } from './user';

export interface IBSState {
  user: IUser;
  team: ITeam;
  // config: IGlobalConfig;

  doing: IDoing;
  blocking: boolean;

  query: Record<string, any>;

  recordId: string;
  datasetId: string;
  classifications: IClassification[];

  // fitler
  activeSource: string[];
  filterClasses: string[];
}
