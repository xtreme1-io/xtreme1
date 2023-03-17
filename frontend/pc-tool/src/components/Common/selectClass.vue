<template>
    <a-select
        :size="_attr.size"
        ref="select"
        showSearch
        animation="no"
        :disabled="_attr.disabled"
        :value="value"
        :listHeight="9999"
        :virtual="false"
        optionFilterProp="label"
        :options="options"
        @search="onSearchChange"
        style="width: 250px"
        :dropdownStyle="{ 'overflow-y': 'auto', 'max-height': '50vh' }"
        dropdownClassName="i-select-class-dropdown"
        @change="onClassChange"
    >
        <template #option="{ label, value, color }">
            <span class="class-label limit" :title="label || value"> {{ label || value }}</span>
        </template>
        <template #dropdownRender="{ menuNode: menu }">
            <div v-show="recentClass.length > 0">
                <div class="ant-select-item recent-title">{{ $$('class-recent') }}</div>
                <div
                    v-for="item in recentClass"
                    @click="onRecentClick(item)"
                    class="ant-select-item recent-item"
                >
                    <span class="class-label limit" :title="item.label">{{ item.label }}</span>
                </div>
                <a-divider style="margin: 4px 0" />
            </div>
            <VNodes :vnodes="menu" />
        </template>
    </a-select>
</template>
<script lang="ts" setup>
    import { computed, reactive, ref } from 'vue';
    import { useInjectEditor } from '../../state';
    import * as locale from './lang';
    import { IOption } from '../../type';

    const editor = useInjectEditor();
    let $$ = editor.bindLocale(locale);
    const emit = defineEmits(['update:value', 'change', 'recentClick']);
    const props = defineProps<{
        value: any;
        beforeAddRecent?: Function;
        attr?: {
            disabled?: boolean;
            size?: 'small' | 'large' | 'default';
        };
    }>();
    let select = ref(null);
    const iState = reactive({
        searchValue: '',
    });
    const TState = editor.state;
    const _attr = computed(() => {
        return Object.assign(
            {
                disabled: false,
                size: 'default',
            },
            props.attr || {},
        );
    });
    const options = computed(() => {
        return editor.state.classTypes.map((item) => {
            return {
                // ...item,
                value: item.id,
                label: item.label || item.name,
            };
        });
    });
    const recentClass = computed(() => {
        const reg = new RegExp(iState.searchValue, 'i');
        return TState.recentClass
            .filter((item) => reg.test(item.label))
            .map((e) => {
                return { value: e.name, label: e.label || e.name };
            });
    });
    function VNodes(_: any, { attrs }: any) {
        return attrs.vnodes;
    }
    function addRecentClass(value: any) {
        // first remove and add
        const item = TState.classTypes.find((e) => e.id === value);
        if (!item) return;
        let newRecentClass = TState.recentClass.filter((e) => e.name !== value);
        newRecentClass.unshift(item);

        if (newRecentClass.length > 3) {
            newRecentClass = newRecentClass.slice(0, 3);
        }

        TState.recentClass = newRecentClass;
    }
    function onSearchChange(value: string) {
        iState.searchValue = value;
    }
    function onRecentClick(item: IOption) {
        (select.value as any).blur();
        emit('recentClick', item.value, item);
        onClassChange(item.value, item);
    }
    function onClassChange(value: any, item: IOption) {
        iState.searchValue = '';
        emit('update:value', value, item);
        emit('change', value, item);
        addRecentClass(value);
    }
    defineExpose({
        addRecentClass,
    });
</script>
<style lang="less">
    .class-label {
        display: inline-block;
        width: 200px;
    }
    .ant-select-item.recent-title {
        color: #878787;
        font-weight: bold;
    }
    .ant-select-item.recent-item:hover {
        background: rgba(255, 255, 255, 0.08);
    }
    .i-select-class-dropdown {
        z-index: 9999;
    }
</style>
