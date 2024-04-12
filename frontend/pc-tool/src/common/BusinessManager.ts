import {
    BusinessManager as BaseBusinessManager,
    IDataResource,
    IFrame,
    IObject,
    utils,
    IFileConfig,
    SourceType,
} from 'pc-editor';
import Editor from './Editor';
import * as api from '../api';

export default class BusinessManager extends BaseBusinessManager {
    editor: Editor;
    constructor(editor: Editor) {
        super(editor);
        this.editor = editor;
    }

    async loadFrameConfig(data: IFrame): Promise<IDataResource> {
        const regLidar = new RegExp(/point(_?)cloud/i);
        const regConfig = new RegExp(/camera(_?)config/i);
        let { configs: fileConfig, name } = await api.getDataFile(data.id + '');
        if (fileConfig.filter((e) => regLidar.test(e.dirName)).length === 0) {
            throw this.editor.lang('no-point-data');
        }
        let cameraConfig = fileConfig.find((e) => regConfig.test(e.dirName)) as IFileConfig;

        // no camera config
        let cameraInfo = [];
        if (cameraConfig) {
            cameraInfo = await api.getUrl(cameraConfig.url);
        }

        let info = utils.createViewConfig(fileConfig, cameraInfo);
        let config: IDataResource = {
            pointsUrl: info.pointsUrl,
            pointsData: {},
            viewConfig: info.config,
            time: 0,
            name: name,
        };
        return config;

        // return {} as IDataResource;
    }

    async getFrameClassification(
        frame: IFrame | IFrame[],
    ): Promise<Record<string, Record<string, string>>> {
        let valueMap = await api.getDataClassificationBatch(
            Array.isArray(frame) ? frame.map((e) => e.id) : frame.id,
        );
        return valueMap;
    }

    async getFrameObject(frame: IFrame | IFrame[]): Promise<{
        objectsMap: Record<string, IObject[]>;
        classificationMap: Record<string, IObject[]>;
        queryTime: string;
    }> {
        let data = await api.getDataObjectBatch(
            Array.isArray(frame) ? frame.map((e) => e.id) : frame.id,
        );
        return data;
    }
}
