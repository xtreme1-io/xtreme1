import * as pageHandler from '../pages';
import { setToken } from '../api/base';
import { useInjectTool } from '../state';
import Event from '../config/event';
import * as _ from 'lodash';
import { enableEscOnFullScreen } from '../utils';
import useQuery from './useQuery';
import useToken from './useToken';

export type IHandlerType = keyof typeof pageHandler;

export default function UseFlow() {
    let tool = useInjectTool();
    let editor = tool.editor;
    let query = useQuery();
    let token = useToken();

    // datasetId=30093&dataId=352734&type=readOnly

    let mode = getMode(query);
    let handler = pageHandler[mode]();
    // let handler = pageHandler.dev();

    function init() {
        iniQuery();

        if (!token) {
            editor.showMsg('error', 'Not logged in');
            console.log('Not logged in');
            return;
        }
        setToken(token);

        initFlowEvent();
        handleUnload();
        enableEscOnFullScreen();
        handler.init();
    }

    function handleUnload() {
        if (!import.meta.env.DEV) {
            window.addEventListener('beforeunload', (event: Event) => {
                console.log('beforeunload');
                if (tool.needSave()) {
                    event.preventDefault();
                    // @ts-ignore
                    event.returnValue = "You didn't save changes?";
                }
            });
        }
    }

    function initFlowEvent() {
        // tool.editor.addEventListener(Event.FLOW_ACTION, (data: any) => {
        //     // console.log(data.data);
        //     handler.onAction(data.data);
        // });
    }

    function iniQuery() {
        let { state } = tool;
        Object.assign(state.query, query || {});
        state.recordId = (query.recordId as string) || '';
        state.datasetId = (query.datasetId as string) || '';
        if (query.dataId as string) {
            state.focus = {
                dataId: (query.dataId as string) || '',
                focusId: +(query.focus as string),
            };
        }
    }

    return {
        init,
    };
}

function getMode(query: Record<string, any>): IHandlerType {
    let mode = 'execute' as IHandlerType;
    if (query.type === 'readOnly') {
        mode = 'view';
    }

    return mode;
}
