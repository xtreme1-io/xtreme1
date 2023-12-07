import { IObject } from '../type';

export function getTrackFromObject(info: Record<string, IObject[]>) {
    let globalTrack = {} as Record<string, Partial<IObject>>;
    // let frameTrack = {} as Record<string, Record<string, Partial<IObject>>>;

    Object.keys(info).forEach((frameId) => {
        let objects = info[frameId] || [];

        // frameTrack[frameId] = frameTrack[frameId] || {};

        objects.forEach((obj) => {
            let trackId = obj.trackId as string;

            if (!globalTrack[trackId]) {
                globalTrack[trackId] = {
                    trackName: obj.trackName,
                    trackId: obj.trackId,
                    classType: obj.classType,
                    classId: obj.classId,
                    resultType: obj.resultType,
                };
            } else {
                Object.assign(obj, globalTrack[trackId]);
                obj.resultType = globalTrack[trackId].resultType;
            }
        });
    });

    return { globalTrack };
}
