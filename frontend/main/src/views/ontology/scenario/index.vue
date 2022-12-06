<template>
  <div :class="`${prefixCls}`" v-loading="loadingRef">
    <div class="classes__left">
      <div class="actions">
        <VirtualTab :list="tabListOntology" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  // vue
  import { ref } from 'vue';
  // components
  import { VirtualTab } from '/@@/VirtualTab';
  // icons
  import Ontology from '/@/assets/svg/tags/ontology.svg';
  import OntologyActive from '/@/assets/svg/tags/ontologyActive.svg';
  import Scenario from '/@/assets/svg/tags/scenario.svg';
  import ScenarioActive from '/@/assets/svg/tags/scenarioActive.svg';
  // utils
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { RouteChildEnum } from '/@/enums/routeEnum';

  const { t } = useI18n();
  const { prefixCls } = useDesign('ontologyScenario');
  const loadingRef = ref<boolean>(false);

  /** Virtual Tab */
  const tabListOntology = [
    {
      name: t('business.ontology.ontology'),
      url: RouteChildEnum.ONTOLOGY_CLASS,
      active: false,
      params: {},
      icon: Ontology,
      activeIcon: OntologyActive,
    },
    {
      name: t('business.ontology.scenario'),
      url: RouteChildEnum.ONTOLOGY_SCENARIO,
      active: true,
      params: {},
      icon: Scenario,
      activeIcon: ScenarioActive,
    },
  ];
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-ontologyScenario';
  .@{prefix-cls} {
    display: flex;
    height: 100%;
    padding: 15px 20px;
  }
</style>
