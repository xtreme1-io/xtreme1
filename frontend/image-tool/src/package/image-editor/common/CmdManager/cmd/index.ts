import AddObject, { IAddObjectOption } from './AddObject';
import DeleteObject, { IDeleteObjectOption } from './DeleteObject';
import UpdateUserData, { IUpdateUserDataOption } from './UpdateUserData';
import UpdateTransform, { IUpdateTransformOption } from './UpdateTransform';
import UpdateAttrs, { IUpdateAttrsOption } from './UpdateAttrs';
import AddTrack, { IAddTrackOption } from './AddTrack';
import UpdateTrack, { IUpdateTrackOption } from './UpdateTrack';
import DeleteTrack, { IDeleteTrackOption } from './DeleteTrack';

export interface ICmdOption {
  'add-object': IAddObjectOption;
  'delete-object': IDeleteObjectOption;
  'update-user-data': IUpdateUserDataOption;
  'update-transform': IUpdateTransformOption;
  'update-attrs': IUpdateAttrsOption;
  'add-track': IAddTrackOption;
  'update-track': IUpdateTrackOption;
  'delete-track': IDeleteTrackOption;
}

type Name = keyof ICmdOption;
const CMD: Record<Name, any> = {
  'add-object': AddObject,
  'delete-object': DeleteObject,
  'update-user-data': UpdateUserData,
  'update-transform': UpdateTransform,
  'update-attrs': UpdateAttrs,
  'add-track': AddTrack,
  'update-track': UpdateTrack,
  'delete-track': DeleteTrack,
};

export default CMD;
