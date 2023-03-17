<template>
    <div class="pc-editor-operation">
        <!-- <Instructions /> -->
        <Instance />
        <Classification />
        <Results />
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

    // import Instructions from './Instructions/index.vue';
    import Instance from './Results/index.vue';
    import Results from './Instance/index.vue';
    import Classification from './Classification/index.vue';

    let state = reactive({
        activeTabs: ['instance', 'classification'],
    });
</script>

<style lang="less">
    .pc-editor-operation {
        color: white;
        height: 100%;
        overflow-y: overlay;
        &::-webkit-scrollbar {
            width: 0;
        }
    }
</style>
