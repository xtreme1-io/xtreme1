<template>
  <div class="pc-editor-tool">
    <div :key="chatItem.id" v-for="(chatItem, index) in data">
      <div class="flex" v-if="chatItem?.role === 'prompter'">
        <div class="user"> A </div>
        <div class="prompter">
          <div>
            {{ chatItem?.text }}
          </div>
          <div class="thumbs">
            <SvgIcon
              @click="chatItem.isThumbsup = false"
              v-if="chatItem.isThumbsup"
              name="had-thumbs-up"
            />
            <SvgIcon
              @click="(chatItem.isThumbsup = true), (chatItem.isThumbsdown = false)"
              v-else
              name="thumbs-up"
            />

            <SvgIcon
              @click="chatItem.isThumbsdown = false"
              v-if="chatItem.isThumbsdown"
              name="had-thumbs-down"
            />
            <SvgIcon
              @click="(chatItem.isThumbsdown = true), (chatItem.isThumbsup = false)"
              v-else
              name="thumbs-down"
            />
          </div>
        </div>
      </div>
      <div style="justify-content: end" class="flex" v-if="chatItem?.role === 'assistant'">
        <div class="assistant">
          <div>
            {{ chatItem?.text }}
          </div>

          <div class="thumbs">
            <SvgIcon
              @click="chatItem.isThumbsup = false"
              v-if="chatItem.isThumbsup"
              name="had-thumbs-up"
            />
            <SvgIcon
              @click="(chatItem.isThumbsup = true), (chatItem.isThumbsdown = false)"
              v-else
              name="thumbs-up"
            />

            <SvgIcon
              @click="chatItem.isThumbsdown = false"
              v-if="chatItem.isThumbsdown"
              name="had-thumbs-down"
            />
            <SvgIcon
              @click="(chatItem.isThumbsdown = true), (chatItem.isThumbsup = false)"
              v-else
              name="thumbs-down"
            />
          </div>
        </div>
        <div class="user"> B </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import Icon, { SvgIcon } from '/@/components/Icon';
</script>

<style lang="less">
  .pc-editor-tool {
    padding: 20px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;

    & > div {
      width: 100%;
      .thumbs {
        text-align: right;
        padding-top: 10px;
        svg {
          margin: 0 6px;
          cursor: pointer;
        }
      }
      .prompter {
        // word-break: break-all;
        max-width: calc(100% - 150px);
        color: #fff;
        font-size: 16px;
        line-height: 26px;
        padding: 16px;
        background: #555b76;
        border-radius: 0px 24px 24px 24px;
        margin-bottom: 20px;
      }
      .assistant {
        max-width: calc(100% - 150px);
        color: #fff;
        font-size: 16px;
        line-height: 26px;
        padding: 16px;
        background: #5e80a9;
        border-radius: 24px 0px 24px 24px;
        margin-bottom: 20px;
      }
      .user {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 1px solid #aaa;
        text-align: center;
        line-height: 30px;
        margin: 0 10px;
        background: #fff;
      }
    }
    .divider {
      border-top: 1px solid #0f0909;
      display: inline-block;
      width: 38px;
      vertical-align: middle;
      &.dashed {
        border-top: 1px dashed #6c6c6c;
      }
    }
    .item {
      width: 38px;
      font-size: 12px;
      border-radius: 4px;
      background: #1e1f22;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #bec1ca;
      cursor: pointer;
      padding: 8px 0px;
      margin: 4px 0;
      position: relative;
      .msg {
        position: absolute;
        right: 2px;
        top: 2px;
        color: white;
        background: red;
        border-radius: 30px;
        font-size: 16px;
        display: inline-block;
        width: 14px;
        height: 14px;
        line-height: 14px;
        text-align: center;
      }
      .anticon,
      .iconfont {
        font-size: 18px;
      }

      &:disabled {
        background: #6d7278;
      }

      &:hover {
        .iconfont {
          color: #57ccef;
        }
      }
      &.active {
        background: #57ccef;
        color: #dee5eb;
        .iconfont {
          color: #dee5eb;
        }
        .interactive {
          color: #57ccef;
        }
      }
    }
    &.edit .item-float-content {
      display: flex;
    }
    .item-float-content {
      display: none;
      position: absolute;
      top: 10px;
      right: -60px;
      height: 108px;
      width: 46px;
      background-color: #3a3a3e;
      z-index: 1;
      border-radius: 6px;
      box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.15);
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      & + .item-float-content {
        top: 128px;
      }
      .float-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        cursor: pointer;
        &:hover {
          color: #57ccef;
          .iconfont {
            color: inherit;
          }
        }
      }
      .item-title {
        padding: 4px 0;
        font-size: 12px;
      }
      .item-img {
        width: 24px;
      }
    }
  }

  .tool-bottom {
    position: absolute;
    bottom: 0px;
    left: 0px;
    right: 0px;
    height: 120px;
    flex-direction: column-reverse;
  }

  .tool-info-tooltip {
    max-width: 300px;
    width: 300px;
    min-height: 100px;
    background: #333333;
    border-radius: 4px;
    padding: 4px;
    color: #bec1ca;
    font-size: 12px;

    .ant-slider-handle {
      background-color: #ffffff;
      border: solid 2px #2e8cf0;
    }

    .ant-slider-track {
      background-color: #2e8cf0;
    }

    .ant-tooltip-inner {
      color: #bec1ca;
    }

    .ant-checkbox-wrapper {
      margin-left: 0px !important;
      margin-right: 10px !important;
      margin-bottom: 10px !important;
    }

    .divider {
      border-top: 1px solid #6c6c6c;
      display: inline-block;
      width: 240px;
      vertical-align: middle;
    }

    .ant-tooltip-arrow {
      display: none;
    }
    .ant-tooltip-content {
      position: relative;
      .close {
        position: absolute;
        right: 6px;
        top: 6px;
        font-size: 20px;
        cursor: pointer;
      }
    }

    .ant-tooltip-inner {
      box-shadow: none;
    }

    .wrap {
      padding-left: 8px;
      // .ant-row {
      //     font-size: 12px;
      //     line-height: 21px;
      // }
    }

    .title1 {
      // font-weight: bold;
      font-size: 16px;
      line-height: 36px;
      color: white;
      text-align: center;
    }

    .title2 {
      // font-weight: 600;
      font-size: 12px;
      line-height: 30px;
      color: white;
    }

    .title3 {
      font-size: 12px;
      line-height: 26px;
    }

    .ant-checkbox-wrapper {
      font-size: 12px;
      color: #bec1ca;
    }
  }
</style>
