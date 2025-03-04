<template>
  <div class="modal-add-comment">
    <Row v-if="objectTypes.length > 1" :gutter="10" :wrap="false" style="margin-bottom: 10px">
      <Col :span="4" style="text-align: right">{{ t('image.results') }}</Col>
      <Col :flex="1">
        <RadioGroup
          buttonStyle="solid"
          v-model:value="formComment.commentObject"
          @change="
            () => {
              formComment.types = [];
            }
          "
        >
          <RadioButton v-for="item in objectTypes" :key="item" :value="item">
            {{ editor.tI(item) }}</RadioButton
          >
        </RadioGroup>
      </Col>
    </Row>
    <Row :gutter="10" :wrap="false">
      <Col :span="4" style="text-align: right">{{ t('image.Type') }}</Col>
      <Col :flex="1">
        <Tag
          v-for="item in commentTags"
          :key="item.entityId"
          class="annotation-tag"
          v-bind="getBindItemData(item)"
          @click="() => onChangeTag(item)"
        >
          {{ item.name }}
        </Tag>
      </Col>
    </Row>
    <Row v-if="isContainMiss" :gutter="10" :wrap="false">
      <Col :span="4" style="text-align: right">{{ t('image.class') }}</Col>
      <Col :flex="1">
        <CompClassItem
          v-for="item in classTags"
          :option="item"
          :key="item.id"
          :hover="true"
          :labelKey="editor.state.config.nameShowType"
          @change="(_, item) => onTagClick(item)"
        />
      </Col>
    </Row>
    <Row :gutter="10" :wrap="false">
      <Col :span="4" style="text-align: right">{{ t('image.Comment') }}</Col>
      <Col :flex="1">
        <Textarea v-model:value="formComment.comment" :rows="4" @keyup.enter="onOk" />
        <div v-if="commentMsg" class="comment-msg">
          {{ commentMsg }}
        </div>
      </Col>
    </Row>
    <div class="footer">
      <Button type="primary" :disabled="!btnEnable" @click="onOk">
        {{ t('image.confirm') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, computed } from 'vue';
  import { useInjectBSEditor } from '../../context';
  import { Button, Textarea, Row, Col, Tag, RadioButton, RadioGroup } from 'ant-design-vue';
  import {
    CommentObjectType,
    configs,
    CommentTabType,
    CommentWrongType,
    ICommentTag,
  } from '../../config/comment';
  import { IClassType, IClassTypeItem } from 'image-editor';
  import { CompClassItem } from '@basicai/tool-components';
  import { t } from '@/lang';

  interface ICommentContent {
    types: number[];
    comment: string;
    commentObject: CommentTabType;
    classId: string;
  }
  // ***************Props and Emits***************
  const emit = defineEmits(['cancel', 'ok']);
  const props = withDefaults(
    defineProps<{
      data: {
        type: CommentTabType;
      };
    }>(),
    {
      data: () => {
        return {
          type: CommentTabType.object,
        };
      },
    },
  );
  // ***************Props and Emits***************

  const editor = useInjectBSEditor();
  // eslint-disable-next-line vue/no-setup-props-destructure
  const formComment = reactive<ICommentContent>({
    types: [],
    comment: '',
    commentObject: props.data.type,
    classId: '',
  });
  const classTags = computed(() => {
    const classes = editor.getClassTypesByToolmode();
    const childrenMap = classes.reduce<Record<string, IClassTypeItem[]>>(
      (m, item: IClassTypeItem) => {
        if (item.parentId) {
          if (!m[item.parentId]) m[item.parentId] = [];
          m[item.parentId].push(item);
        }
        return m;
      },
      {},
    );
    return classes
      .filter((c) => {
        return !c.parent;
      })
      .map(function createClassDataOption(item: IClassTypeItem): any {
        return {
          item: item,
          active: item.id == formComment.classId,
          disabled: false,
          withIcon: false,
          children: (childrenMap[item.id] || []).map(createClassDataOption),
        };
      });
  });
  const objectTypes = computed(() => {
    let options: CommentTabType[] = [];
    if (props.data.type === CommentTabType.point) {
      options = [CommentTabType.object, CommentTabType.point];
    }
    return options;
  });
  const commentTags = computed(() => {
    let list = editor.dataManager.commentTypes || configs;
    list = list
      .filter((e) => {
        const validMode = e.annotationTypes.includes(editor.state.imageToolMode);
        if (formComment.commentObject === CommentTabType.point)
          return e.resultType === CommentObjectType.POINT && validMode;
        return e.resultType === CommentObjectType.OBJECT && validMode;
      })
      .map((e) => {
        e.disable = !(
          e.wrongType == CommentWrongType.DISCUSSION ||
          (e.wrongType === CommentWrongType.MISS &&
            formComment.commentObject === CommentTabType.empty) ||
          (e.wrongType === CommentWrongType.WRONG &&
            formComment.commentObject !== CommentTabType.empty)
        );
        return e;
      });
    return list;
  });
  const isContainMiss = computed(() => {
    const missTag = commentTags.value.filter((t) => t.wrongType === CommentWrongType.MISS);
    return formComment.types.some((id) => missTag.some((t) => t.entityId == id));
  });
  const checkMissedClass = () => {
    const miss = formComment.types.filter((e) =>
      commentTags.value.find((t) => t.entityId === e && t.wrongType == CommentWrongType.MISS),
    );
    return miss.length > 0;
  };
  const needInputMap = computed<Record<string, boolean>>(() => {
    return commentTags.value.reduce((re, i) => {
      if (i.wrongType == CommentWrongType.DISCUSSION) {
        re[i.entityId] = true;
      }
      return re;
    }, {} as Record<string, boolean>);
  });
  const commentMsg = computed(() => {
    if (
      formComment.types.some((key) => needInputMap.value[key]) &&
      (!formComment.comment || formComment.comment.trim() === '')
    ) {
      return t('image.holderComment');
    } else if (formComment.comment && formComment.comment.length > 500) {
      return t('image.msgChar');
    }
    return false;
  });
  const btnEnable = computed(() => {
    const hasType = formComment.types.length > 0;
    const hasWarning = !!commentMsg.value;
    return hasType && !hasWarning;
  });
  function valid(): Promise<boolean> {
    return Promise.resolve(true);
  }
  function onOk() {
    if (editor.bsState.isVisitorClaim) {
      editor.showMsg('warning', t('image.visitorTips'));
      return;
    }
    emit('ok');
  }
  function getData() {
    const allComents: Record<string, ICommentTag> = {};
    (editor.dataManager.commentTypes || configs).forEach(
      (e) => (allComents[String(e.entityId)] = e),
    );
    const types = formComment.types.map((e) => {
      const tag = allComents[String(e)];
      return { entityId: tag.entityId, entityVersion: tag.entityVersion };
    });
    if (!checkMissedClass()) formComment.classId = '';
    return {
      ...formComment,
      types,
    };
  }
  function onTagClick(item: IClassType) {
    formComment.classId = formComment.classId == item.id ? '' : item.id;
  }
  function isDisable(item: ICommentTag) {
    const hasObject = CommentTabType.empty !== props.data.type;
    const isMiss = item.wrongType == CommentWrongType.MISS;
    const isWrong = item.wrongType == CommentWrongType.WRONG;
    if (hasObject && isMiss) return true;
    if (!hasObject && isWrong) return true;
    return false;
  }
  function getBindItemData(item: ICommentTag) {
    const active = formComment.types.some((key) => key == item.entityId);
    const style: Partial<Record<keyof CSSStyleDeclaration, any>> = {};
    const color = item.color || '#57CCEF';
    const disableBg = '#ffffff14';
    const disableColor = '#ffffff4c';
    if (active) {
      style.backgroundColor = color;
    } else if (isDisable(item)) {
      style.backgroundColor = disableBg;
      style.color = disableColor;
      style.cursor = 'not-allowed';
    } else {
      style.color = color;
      style.borderColor = color;
    }

    return {
      style: style,
    };
  }
  function onChangeTag(item: ICommentTag) {
    if (isDisable(item)) return;
    const index = formComment.types.findIndex((e) => e == item.entityId);
    if (index >= 0) {
      formComment.types.splice(index, 1);
    } else {
      formComment.types.push(item.entityId);
    }
    if (!isContainMiss.value) {
      formComment.classId = '';
    }
  }
  defineExpose({
    valid,
    getData,
  });
</script>

<style lang="less">
  .modal-add-comment {
    .comment-msg {
      color: #f8827b;
    }

    .annotation-tag {
      margin-bottom: 6px;
      // line-height: 24px;line-height
      border-radius: 10px;
      font-size: 14px;
      cursor: pointer;
    }

    .footer {
      margin-top: 10px;
      text-align: right;
    }
  }
</style>
