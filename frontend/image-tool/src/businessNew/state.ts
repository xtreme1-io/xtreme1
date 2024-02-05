import { __ALL__ } from 'image-editor';
import { IBSState } from './types';

export function getDefault(): IBSState {
  return {
    blocking: false,
    user: {} as any,
    team: {} as any,
    query: {},
    recordId: '',
    doing: { saving: false, marking: false, skip: false, submitting: false, modify: false },
    datasetId: '',
    classifications: [],
    activeSource: [__ALL__],
    filterClasses: [__ALL__],
  };
}
