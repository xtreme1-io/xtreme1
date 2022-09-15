import * as pageHandler from '../pages';
import { useInjectEditor } from '../state';
import { setToken } from '../api/base';
import Event from '../config/event';
import * as _ from 'lodash';

import useQuery from './useQuery';
import useToken from './useToken';

export type IHandlerType = keyof typeof pageHandler;

export default function UseFlow() {
    let editor = useInjectEditor();
    let { bsState, state } = editor;
    let query = useQuery();
    let token = useToken();

    // datasetId=30093&dataId=352734&type=readOnly

    let mode = getMode(query);
    let handler = pageHandler[mode]();
    // let handler = pageHandler.dev();

    async function init() {
        iniQuery();

        if (!token) {
            editor.showMsg('error', editor.lang('not-login'));
            return;
        }
        setToken(token);

        initFlowEvent();
        handleUnload();

        await handler.init();
    }

    function handleUnload() {
        window.addEventListener('beforeunload', (event: Event) => {
            console.log('beforeunload');
            if (editor.needSave()) {
                event.preventDefault();
                // @ts-ignore
                event.returnValue = editor.lang('msg-not-save');
            }
        });
    }

    function initFlowEvent() {
        editor.addEventListener(Event.FLOW_ACTION, (data) => {
            // console.log(data.data);
            handler.onAction(data.data);
        });
    }

    function iniQuery() {
        Object.assign(bsState.query, query || {});
        bsState.recordId = (query.recordId as string) || '';
        bsState.datasetId = (query.datasetId as string) || '';
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
