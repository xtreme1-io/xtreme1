import { IObject } from '../type';
import Editor from '../common/Editor';
import { IUserData, ToolModelEnum, utils } from 'image-editor';

export function getTrackInfo(objects: IObject[], editor: Editor) {
  const { config } = editor.state;
  const globalTrack = {} as Record<string, Partial<IUserData>>;
  // let frameTrack = {} as Record<string, Record<string, Partial<IObject>>>;

  const trackNames = objects
    .filter((e) => e.trackName)
    .map((e) => parseInt(e.trackName as any))
    .filter((e) => !isNaN(e));

  let maxId = 0;
  trackNames.forEach((name) => {
    maxId = Math.max(name, maxId);
  });

  objects.forEach((obj) => {
    if (!obj.trackId) obj.trackId = utils.createTrackId();
    const trackId = obj.trackId as string;

    if (!globalTrack[trackId]) {
      const classConfig = editor.getClassType(obj.classId || '');
      let trackName = obj.trackName;
      if (!trackName) trackName = '' + maxId++;
      globalTrack[trackId] = {
        trackName: trackName,
        trackId: obj.trackId,
        classType: classConfig ? classConfig.name : '',
        classId: classConfig ? classConfig.id : '',
        sourceId: obj.sourceId || config.defaultSourceId,
        annotationType: obj.type === 'MASK' ? ToolModelEnum.SEGMENTATION : ToolModelEnum.INSTANCE,
        // sourceType: obj.sourceType || SourceType.DATA_FLOW,
      };
    } else {
      Object.assign(obj, globalTrack[trackId]);
    }
  });
  // });

  return { globalTrack, maxId };
}
