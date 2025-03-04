import AddObject, { IAddObjectOption } from './AddObject';
import DeleteObject, { IDeleteObjectOption } from './DeleteObject';
import UpdateUserData, { IUpdateUserDataOption } from './UpdateUserData';
import UpdateTransform, { IUpdateTransformOption } from './UpdateTransform';
import UpdatePoints, { IUpdatePointsOption } from './UpdatePoints';
import UpdateAttrs, { IUpdateAttrsOption } from './UpdateAttrs';
import MoveObjectIndex, { IMoveObjectIndexOption } from './MoveObjectIndex';
import AddTrack, { IAddTrackOption } from './AddTrack';
import DeleteTrack, { IDeleteTrackOption } from './DeleteTrack';
import UpdateTrack, { IUpdateTrackOption } from './UpdateTrack';
import UpdateMask, { IUpdateMaskOption } from './updateMask';
import UpdateAnchorsInfo, { IUpdateAnchorsInfoOption } from './UpdateAnchorsInfo';

export interface ICmdOption {
  'move-object-index': IMoveObjectIndexOption;
  'add-object': IAddObjectOption;
  'delete-object': IDeleteObjectOption;
  'update-user-data': IUpdateUserDataOption;
  'update-anchors-info': IUpdateAnchorsInfoOption;
  'update-transform': IUpdateTransformOption;
  'update-points': IUpdatePointsOption;
  'update-attrs': IUpdateAttrsOption;
  'add-track': IAddTrackOption;
  'delete-track': IDeleteTrackOption;
  'update-track': IUpdateTrackOption;
  'update-mask': IUpdateMaskOption;
}

type Name = keyof ICmdOption;
const CMD: Record<Name, any> = {
  'move-object-index': MoveObjectIndex,
  'add-object': AddObject,
  'delete-object': DeleteObject,
  'update-user-data': UpdateUserData,
  'update-transform': UpdateTransform,
  'update-points': UpdatePoints,
  'update-attrs': UpdateAttrs,
  'add-track': AddTrack,
  'delete-track': DeleteTrack,
  'update-track': UpdateTrack,
  'update-mask': UpdateMask,
  'update-anchors-info': UpdateAnchorsInfo,
};

export default CMD;
