<template>
  <Popover trigger="click" overlayClassName="metricsPopover" :destroyTooltipOnHide="true">
    <template #content>
      <div class="content">
        <table style="margin-top: 0.5rem">
          <tbody>
            <tr class="header">
              <td>name</td>
              <td>value</td>
              <td>description</td>
            </tr>

            <tr class="body" :key="index + item.name" v-for="(item, index) in data">
              <td>{{ item.name }}</td>
              <td>{{ item.value }}</td>
              <td>{{ item.description }}</td>
            </tr>
          </tbody>
        </table>

        <!-- <div class="item" :key="index + item.name" v-for="(item, index) in data"
          ><div style="border-right: 1px solid #aaa"> {{ item.name }} </div>
          <div style="border-right: 1px solid #aaa"> {{ item.value }} </div>
          <div> {{ item.description }} </div></div
        > -->
      </div>
    </template>
    <a class="more"> More </a>
  </Popover>
</template>
<script lang="ts" setup>
  import { computed, toRefs } from 'vue';
  import { Popover } from 'ant-design-vue';

  const props = defineProps<{ metrics: any }>();
  let data = computed(() => {
    // { name: 'name:', value: 'value:', description: 'description:' },
    return [...props?.metrics];
  });
  // let {metricsList}=toRefs(props.metrics)
</script>
<style lang="less" scoped>
  .content {
    padding: 0 8px 8px 8px;
    max-height: 70vh;
    overflow: auto;
    tbody {
      // display: flex;

      td {
        padding: 5px 10px;
      }
      tr.header {
        background: #eee;
        border-bottom: 1px solid #aaa;
        td {
          font-weight: 700;
        }
      }
      tr.body {
        border-bottom: 1px solid #aaa;
      }
    }
  }
  .more {
    cursor: pointer;
  }
</style>
<style lang="less">
  .metricsPopover {
    .ant-popover-content {
      border-radius: 8px;

      .ant-popover-arrow {
        display: none;
      }

      .ant-popover-inner {
        position: relative;
        overflow: auto;
        border-radius: 8px;
        box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.15);

        &::-webkit-scrollbar {
          width: 0;
        }
        .ant-popover-inner-content {
          padding: 0;
          margin-top: 0px;
        }
      }
    }
  }
</style>
