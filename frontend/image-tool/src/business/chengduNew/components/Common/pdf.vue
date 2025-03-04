<template>
  <div style="overflow: auto; width: 100vw; height: 100vh">
    <vue-pdf-embed :source="getSource()"></vue-pdf-embed>
  </div>
</template>
<script lang="ts" setup>
  import VuePdfEmbed from 'vue-pdf-embed';
  import useQuery from './../../hook/useQuery';
  const { query } = useQuery();
  const getSource = () => {
    return query.url as string;
  };
</script>
