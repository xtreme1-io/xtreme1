<template>
    <div class="pc-editor-operation">
        <Results />
        <Classification />
        <!-- <Instance /> -->
        <!-- <a-collapse v-model:activeKey="state.activeTabs" :bordered="false">
            <a-collapse-panel :showArrow="false" key="classification" header="Classifications">
                <Classification />
            </a-collapse-panel>
            <a-collapse-panel :showArrow="false" key="instance" header="Instances">
                <Instance />
            </a-collapse-panel>
        </a-collapse> -->
    </div>
</template>

<script setup lang="ts">
    import { reactive } from 'vue';

    import Results from './Results/index.vue';
    // import Instance from '../Instance/index.vue';
    // import Instance from './Instance/index.vue';
    import Classification from './Classification/index.vue';

    let state = reactive({
        activeTabs: ['instance', 'classification'],
    });
</script>

<style lang="less">
    .pc-editor-operation {
        color: white;
        height: 100%;
        overflow-y: auto;

        .collapse-title {
            font-weight: 600;
        }
    }
</style>
