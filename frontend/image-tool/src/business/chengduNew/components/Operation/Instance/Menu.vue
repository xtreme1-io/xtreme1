<template>
  <teleport :to="getParent()">
    <div
      class="menu"
      ref="menu"
      :style="{ left: `${iState.x}px`, top: `${iState.y}px` }"
      @click.stop="undefined"
      v-show="iState.visible"
    >
      <a-input-search v-model:value="searchValue" size="small"></a-input-search>
      <template v-for="item in iState.data" :key="item.id">
        <div
          :class="{
            item: true,
            'has-child': hasChild(item),
          }"
          @click="hasChild(item) ? undefined : onMenuClick(item)"
        >
          <span class="name">{{ item.name }}</span>
        </div>

        <div v-if="hasChild(item)" class="sub-item-wrap">
          <div
            v-for="subItem in filterBySearch(item.children)"
            :key="subItem.id"
            class="sub-item"
            @click="onMenuClick(subItem)"
          >
            {{ subItem.name }}
          </div>
        </div>
      </template>
    </div>
  </teleport>
</template>

<script setup lang="ts">
  import { reactive, onUpdated, ref } from 'vue';
  import { Vector2, AnnotateObject, GroupObject } from 'image-editor';
  import { useInjectBSEditor } from '../../../context';
  import { Event, IItem } from './type';

  interface IMenuItem {
    name: string;
    action: string;
    children?: IMenuItem[];
    [key: string]: any;
  }
  const searchValue = ref<string>('');
  const menu = ref<HTMLDivElement>();
  const editor = useInjectBSEditor();
  const iState = reactive({
    x: 0,
    y: 0,
    data: [] as IMenuItem[],
    visible: false,
  });

  function getParent() {
    return document.body;
  }

  onUpdated(() => {
    fitPosition();
  });
  const hasChild = (item: IMenuItem) => {
    return item.children && item.children.length > 0;
  };
  const filterBySearch = (items?: IMenuItem[]) => {
    if (!items) return [];
    const reg = new RegExp(searchValue.value, 'i');
    return items.filter((e) => reg.test(e.name));
  };
  // event
  let currentObject = {} as AnnotateObject;
  let currentGroup: GroupObject;
  editor.on(Event.SHOW_INSTANCE_MENU, (clientPos: Vector2, item: IItem, parent: IItem) => {
    // if (!context.container.value) return;

    // console.log('clientPos', clientPos, item);
    validPosition(clientPos);

    iState.x = clientPos.x;
    iState.y = clientPos.y;
    currentObject = getObject(item.id);
    currentGroup = getObject(parent.id) as GroupObject;

    getMenuData(item);

    iState.visible = true;
    setTimeout(() => {
      document.body.removeEventListener('click', hideMenu);
      document.body.addEventListener('click', hideMenu);
    });
  });

  function hideMenu() {
    iState.visible = false;
    document.body.removeEventListener('click', hideMenu);
  }

  function validPosition(clientPos: Vector2) {
    const menuWidth = 120;
    const bodyClientWidth = document.body.clientWidth;
    if (clientPos.x + menuWidth > bodyClientWidth) {
      clientPos.x = clientPos.x - menuWidth;
    }
  }

  function onMenuClick(item: IMenuItem) {
    hideMenu();
    switch (item.action) {
      case 'ungroup':
        editor.cmdManager.execute('move-object-index', {
          object: currentObject,
          index: Infinity,
          from: currentGroup,
        });
        break;
      case 'group':
        const group = getObject(item.id) as any;
        editor.cmdManager.execute('move-object-index', {
          object: currentObject,
          index: Infinity,
          into: group,
          from: currentGroup,
        });
        break;
    }
  }

  function getObject(id: string) {
    return editor.dataManager.getObject(id) as AnnotateObject;
  }

  function getMenuData(item: IItem) {
    const { currentSource } = editor.bsState;
    const object = getObject(item.id);
    const frame = editor.getCurrentFrame();
    const objects = editor.dataManager.getFrameObject(frame.id) || [];

    const groups = objects.filter((e) => {
      const userData = editor.getUserData(e);
      const sourceId = userData.sourceId || '-1';
      const gids = object.groups.map((g) => g.uuid);
      const mids = object.member.map((m) => m.uuid);
      return (
        sourceId === currentSource &&
        e.isGroup() &&
        !gids.includes(e.uuid) &&
        !mids.includes(e.uuid) &&
        e.uuid !== object.uuid
      );
    });

    const menuData = [];
    if (object.groups.length > 0) {
      menuData.push({ name: 'UnGroup', action: 'ungroup' });
    }

    const groupMap = {} as Record<string, IMenuItem>;
    groups.forEach((g) => {
      const userData = editor.getUserData(g);
      const classType = userData.classType || '';
      const trackName = userData.trackName || '';
      if (!groupMap[classType]) {
        groupMap[classType] = {
          name: classType || 'Group',
          action: '',
          children: [],
        };
      }
      (groupMap[classType].children as IMenuItem[]).push({
        name: trackName,
        id: g.uuid,
        action: 'group',
      });
    });

    Object.keys(groupMap).forEach((key) => {
      groupMap[key].children?.sort((a, b) => +b.name - +a.name);
      menuData.push(groupMap[key]);
    });

    // console.log('menuData', menuData);
    iState.data = menuData;
  }

  function fitPosition() {
    const dom = menu.value;
    if (!dom || !iState.visible) return;

    const bodyHeight = document.body.clientHeight;
    const clientRect = dom.getBoundingClientRect();

    if (clientRect.top + clientRect.height > bodyHeight) {
      iState.y = iState.y - clientRect.height;
    }
  }
</script>

<style lang="less" scoped>
  .menu {
    position: absolute;
    padding: 4px;
    border-radius: 4px;
    z-index: 1;
    overflow: auto;
    width: 120px;
    max-height: 400px;
    background: #2f3134;
    box-shadow: 0 0 0 1px rgb(0 0 0 / 53%);

    .item,
    .sub-item {
      line-height: 30px;
      padding: 0 4px;
      cursor: pointer;

      &:hover {
        background: #424d6d;
      }

      &.has-child {
        background: #2f3134;
        color: #999999;
      }
    }

    .sub-item {
      padding-left: 14px;
    }

    .item {
      border-top: 1px solid #545454;

      &:first-child {
        border-top: none;
      }
    }
  }
</style>
