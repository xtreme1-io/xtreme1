<template>
    <div class="add-annotation">
        <a-form :model="state" :rules="rules" ref="formRef">
            <a-form-item name="checked">
                <a-checkbox-group
                    v-model:value="state.checked"
                    :options="editor.state.annotationTags"
                />
            </a-form-item>
            <a-form-item style="margin-top: 10px">
                <a-textarea v-model:value="state.msg" placeholder="请输入批注" :rows="4" />
            </a-form-item>
        </a-form>
        <div style="text-align: center">
            <a-button type="primary" :loading="state.loading" @click="onOk">确定</a-button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { reactive, ref } from 'vue';
    import { useInjectEditor } from '../../../inject';
    // ***************Props and Emits***************
    const emit = defineEmits(['cancel', 'ok']);
    const props = withDefaults(
        defineProps<{
            data: {
                type: 'object' | 'position';
                custom: any;
            };
        }>(),
        {
            data: () => {
                return {
                    type: 'object',
                    custom: null,
                };
            },
        },
    );
    // ***************Props and Emits***************

    const rules = {
        checked: [
            { type: 'array', required: true, message: 'choose at least one', trigger: 'change' },
        ],
    };

    const formRef = ref();
    let editor = useInjectEditor();
    let state = reactive({
        checked:
            props.data.type === 'object'
                ? ['comment_type_result_lable_error']
                : ['comment_type_result_empty'],
        msg: '',
        loading: false,
    });

    function valid(): Promise<boolean> {
        return formRef.value
            .validate()
            .then(() => {
                return true;
            })
            .catch(() => {
                return false;
            });
    }

    function onOk() {
        let data = getData();
        state.loading = true;
        editor.injectBusiness
            .createAnnotation(data)
            .then(() => {
                emit('ok');
            })
            .finally(() => {
                state.loading = false;
            });
    }

    function getData(): any {
        let tagMap: Record<string, any> = {};
        editor.state.annotationTags.forEach((e) => {
            tagMap[e.value] = e;
        });
        let tags = state.checked.map((e) => {
            return { ...tagMap[e] };
        });
        return {
            type: props.data.type,
            data: JSON.stringify(props.data.custom),
            tags: tags,
            msg: state.msg,
        };
    }

    defineExpose({
        valid,
        getData,
    });
</script>

<style lang="less">
    .add-annotation {
    }
</style>
