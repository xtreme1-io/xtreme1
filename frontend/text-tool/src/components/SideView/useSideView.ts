import { onMounted, onBeforeUnmount, reactive, toRefs, computed, Ref } from 'vue';
import * as THREE from 'three';
import { SideRenderView, PointCloud, axisType, Event, ResizeTransAction } from 'pc-render';
import { IActionName } from 'pc-editor';
import { useInjectEditor } from '../../state';
import * as locale from './lang';

interface SideViewProps {
    axis: axisType;
}

export default function useSideView(dom: Ref<HTMLDivElement | null>, props: SideViewProps) {
    let view = {} as SideRenderView;
    let editor = useInjectEditor();
    let $$ = editor.bindLocale(locale);
    let pc = editor.pc;
    let actionName = '' as IActionName;
    let actionTimer = -1 as any;

    let state = reactive({
        axis: props.axis,
        size: new THREE.Vector3(),
        // title: titleMap[props.axis as axisType],
    });

    let title = computed(() => {
        let title = '';
        switch (props.axis) {
            case 'z':
                title = $$('side_overhead');
                break;
            case '-y':
                title = $$('side_side');
                break;
            case '-x':
                title = $$('side_near');
                break;
        }
        return title;
    });

    //**************life hook******************
    onMounted(() => {
        if (dom.value) {
            view = new SideRenderView(dom.value, pc, {
                axis: state.axis,
            });

            // let action = view.getAction('resize-translate') as ResizeTransAction;
            // if (action && (state.axis === '-y' || state.axis === '-x')) action.rotatable = false;

            pc.addRenderView(view);
        }

        view.addEventListener(Event.RENDER_AFTER, onRender);
    });

    onBeforeUnmount(() => {
        view.removeEventListener(Event.RENDER_AFTER, onRender);
    });
    // ************************************

    function onRender() {
        if (!view.object) {
            state.size.set(0, 0, 0);
            return;
        }
        let box = view.object;
        state.size.copy(box.scale);
    }

    function onDBLclick() {
        view.zoom = 1;
        view.enableFit = true;
        view.fitObject();
        view.render();
    }

    function onAction(name: IActionName) {
        actionName = name;
        handleAction();
        handleInterval();
    }

    function handleAction() {
        editor.actionManager.execute(actionName);
        if (!view.enableFit) {
            onDBLclick();
        }
    }

    function handleInterval() {
        if (actionTimer >= 0) return;

        document.addEventListener('mouseup', onDocMouseUp);
        actionTimer = setInterval(() => {
            handleAction();
        }, 50);
    }

    function onDocMouseUp() {
        if (actionTimer < 0) return;
        document.removeEventListener('mouseup', onDocMouseUp);
        clearInterval(actionTimer);
        actionTimer = -1;
    }

    function clearAction() {
        if (actionTimer < 0) return;
        clearInterval(actionTimer);
        actionTimer = -1;
    }

    return {
        ...toRefs(state),
        $$,
        title,
        onDBLclick,
        onAction,
        clearAction,
    };
}
