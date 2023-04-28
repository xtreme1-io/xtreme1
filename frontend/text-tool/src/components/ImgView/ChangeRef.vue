<template>
    <div class="change-ref" v-show="state.objectType === AnnotateType.ANNOTATE_2D">
        <i class="iconfont icon-xinxi"></i>
        <span style="margin-right: 4px">{{ $$('link-to') }}</span>
        <a-select
            v-model:value="state.trackId"
            :disabled="state.isProjection || !canEdit()"
            :allowClear="true"
            size="small"
            @change="onChange"
            style="width: 120px"
        >
            <a-select-option v-for="item in state.list" :value="item.value">{{
                `${item.label} (${item.value})`
            }}</a-select-option>
            <!-- <template #suffixIcon><CloseCircleOutlined /></template> -->
        </a-select>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, ref, onBeforeUnmount, reactive } from 'vue';
    import { Event, AnnotateObject, Object2D, AnnotateType } from 'pc-render';
    import { Event as EditorEvent } from 'pc-editor';
    import { IUserData } from 'pc-editor';
    import { useInjectEditor } from '../../state';
    import useUI from '../../hook/useUI';
    import * as locale from './lang';

    // ***************Props and Emits***************

    // *********************************************

    interface IItem {
        value: string;
        label: string;
        classType: string;
    }

    let { canEdit } = useUI();
    let editor = useInjectEditor();
    let $$ = editor.bindLocale(locale);
    let state = reactive({
        uuid: '',
        trackId: '',
        list: [] as IItem[],
        isProjection: false,
        objectType: '' as AnnotateType | '',
    });

    onMounted(() => {
        editor.pc.addEventListener(Event.SELECT, onSelect);
    });

    onBeforeUnmount(() => {
        editor.pc.removeEventListener(Event.SELECT, onSelect);
    });

    function onChange() {
        let annotate2D = editor.pc.getAnnotate2D();
        let annotate3D = editor.pc.getAnnotate3D();

        let trackId = state.trackId;
        let trackName = '';
        let classType = '';
        let modelClass = '';
        let object = annotate2D.find((e) => e.uuid === state.uuid) as AnnotateObject;
        // let clearFlag = false;

        if (state.trackId) {
            let object3D = annotate3D.find(
                (e) => e.userData.trackId === state.trackId,
            ) as AnnotateObject;
            let userData = object3D.userData as IUserData;

            if (object) {
                trackName = userData.trackName || '';
                classType = userData.classType || '';
                modelClass = userData.modelClass || '';
            }
        } else {
            trackId = object?.userData._trackId;
            trackName = object?.userData._trackName;
            classType = '';
        }

        if (trackId && trackName) {
            let classConfig = editor.state.classTypes.find((e) => e.name === classType);
            object.color = classConfig ? classConfig.color : '#ffffff';
            editor.cmdManager.execute('update-object-user-data', {
                objects: object as AnnotateObject,
                data: { trackId, trackName, classType, modelClass },
            });

            editor.pc.selectObject(editor.pc.selection[0]);

            if (editor.state.config.showClassView) {
                editor.dispatchEvent({
                    type: EditorEvent.SHOW_CLASS_INFO,
                    data: { id: trackId },
                });
            }
        }
    }

    function onSelect() {
        let selection = editor.pc.selection;
        if (selection.length === 1) {
            if (selection[0] instanceof Object2D) {
                let object = selection[0];
                let userData = object.userData as IUserData;

                // old data
                if (!userData._trackId) {
                    userData._trackId = userData.trackId;
                    userData._trackName = userData.trackName;
                }

                state.uuid = object.uuid;
                state.list = getTrackObject();
                state.trackId = (userData.trackId as string) || '';
                state.isProjection = !!userData.isProjection;
                state.objectType = AnnotateType.ANNOTATE_2D;
            } else {
                state.objectType = AnnotateType.ANNOTATE_3D;
            }
        } else {
            state.trackId = '';
            state.objectType = '';
        }
    }

    function getTrackObject() {
        let selection = editor.pc.selection;
        let trackObjects = [] as IItem[];
        let annotate3D = editor.pc.getAnnotate3D();
        // let annotate2D = editor.pc.getAnnotate2D();

        let objects = [...annotate3D] as AnnotateObject[];
        if (selection.length > 0) objects.push(selection[0]);

        objects.forEach((object) => {
            let userData = object.userData as IUserData;
            let trackName = userData.trackName;
            let classType = userData.classType || '';
            let trackId = userData.trackId;
            if (!trackName || !trackId) return;

            let trackNumber = parseInt(trackName);
            if (isNaN(trackNumber)) return;

            if (trackObjects[trackNumber]) return;

            trackObjects[trackNumber] = { value: trackId, label: trackName, classType };
        });

        trackObjects = trackObjects.filter((e) => e);
        return trackObjects;
    }
</script>

<style lang="less"></style>
