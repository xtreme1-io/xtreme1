import * as api from '../api';
// import Editor from '../common/Editor';
import { IObject } from 'pc-editor';

export function pollModelTrack(
    recordId: string,
    onComplete: (e: Record<number, IObject[]>) => void,
    onErr?: () => void,
) {
    let stop = false;
    let hasErr = false;
    poll();
    return clear;

    async function poll() {
        let result;

        try {
            result = await request();
        } catch (error: any) {
            hasErr = true;
        }

        if (stop) return;

        if (hasErr) {
            onErr && onErr();
        } else {
            if (result) onComplete(result);
            else {
                setTimeout(poll, 1000);
            }
        }
    }

    function clear() {
        stop = true;
    }

    async function request() {
        let request = api.getModelResult([], recordId).then((data) => {
            data = data.data || {};
            let resultList = data.modelDataResults || [];
            if (resultList.length === 0) return;

            let dataResult = resultList[0];
            // let dataId = dataResult.dataId as string;
            let objectsMap = {} as Record<number, IObject[]>;
            dataResult.modelResult.forEach((objects: any[], index: number) => {
                if (objects.length === 0) return;

                objectsMap[index] = [];
                objects.forEach((e) => {
                    e.trackId = e.trackingId;
                });
                objectsMap[index] = objects;
            });

            return objectsMap;
        });
        return request;
    }
}
