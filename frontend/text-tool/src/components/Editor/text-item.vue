<template>
    <div class="text" v-if="item?.role === 'prompter'">
        <div class="user" style="color: #57ccef"> A </div>
        <div class="prompter">
            <div>
                {{ item?.text }}
            </div>
            <div class="thumbs">
                <img
                    :src="thumbsUp"
                    v-if="item.direction !== 'up'"
                    @click="onDirection(item, 'up')"
                />
                <img
                    v-if="item.direction === 'up'"
                    :src="hadThumbsUp"
                    @click="onDirection(item, '')"
                />

                <img
                    :src="thumbsDown"
                    v-if="item.direction !== 'down'"
                    @click="onDirection(item, 'down')"
                />
                <img
                    v-if="item.direction === 'down'"
                    :src="hadThumbsDown"
                    @click="onDirection(item, '')"
                    name="hasThumbsDown"
                />
            </div>
        </div>
    </div>
    <div style="justify-content: end" class="flex text" v-if="item?.role === 'assistant'">
        <div class="assistant">
            <div>
                {{ item?.text }}
            </div>

            <div class="thumbs">
                <img
                    :src="thumbsUp"
                    v-if="item.direction !== 'up'"
                    @click="onDirection(item, 'up')"
                />
                <img
                    v-if="item.direction === 'up'"
                    :src="hadThumbsUp"
                    @click="onDirection(item, '')"
                />

                <img
                    :src="thumbsDown"
                    v-if="item.direction !== 'down'"
                    @click="onDirection(item, 'down')"
                />
                <img
                    v-if="item.direction === 'down'"
                    :src="hadThumbsDown"
                    @click="onDirection(item, '')"
                    name="hasThumbsDown"
                />
            </div>
        </div>
        <div class="user" style="color: #576ff3"> B </div>
    </div>
</template>

<script setup lang="ts">
    import { ITextItem } from 'pc-editor';
    import thumbsUp from '/src/assets/img/thumbs-up.png';
    import hadThumbsUp from '/src/assets/img/had-thumbs-up.png';
    import thumbsDown from '/src/assets/img/thumbs-down.png';
    import hadThumbsDown from '/src/assets/img/had-thumbs-down.png';

    interface IProps {
        item: ITextItem;
    }

    const props = defineProps<IProps>();
    const emit = defineEmits(['changed']);

    function onDirection(item:ITextItem, type: 'up' | 'down' | '') {
      emit('changed', item, type);
    }
</script>

<style lang="less" scoped>
    .text {
       width: 100%;
        display: flex;
    }

    .thumbs {
        text-align: right;
        padding-top: 10px;
        img {
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
        background: #515f74;
        border-radius: 0px 24px 24px 24px;
        margin-bottom: 20px;
    }
    .assistant {
        max-width: calc(100% - 150px);
        color: #fff;
        font-size: 16px;
        line-height: 26px;
        padding: 16px;
        background: #555b76;
        border-radius: 24px 0px 24px 24px;
        margin-bottom: 20px;
    }
    .user {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        // border: 1px solid #aaa;
        text-align: center;
        line-height: 32px;
        margin: 0 10px;
        background: #fff;
        font-weight: 700;
    }
</style>
