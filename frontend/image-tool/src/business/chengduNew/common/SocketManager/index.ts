//@ts-ignore
import SockJS from 'sockjs-client/dist/sockjs.js';
import Stomp, { Client, Message } from 'webstomp-client';
import { EventCode } from '@basicai/tool-components';

import Editor from '../Editor';
import useToken from '../../hook/useToken';
import { IMsgBody, codeEvents, IMsgAction, defaultBtns } from './type';
import Event from '../../config/event';
import { LangType } from 'image-editor';

class SocketManager {
  _url: string = '';
  editor: Editor;
  stomp!: Client;
  eventsMap: Partial<Record<EventCode, IMsgAction>> = {};

  constructor(editor: Editor) {
    this.editor = editor;
    this.onConnectSuccess = this.onConnectSuccess.bind(this);
    this.onConnectError = this.onConnectError.bind(this);
    this.onConnectClose = this.onConnectClose.bind(this);
    this.onMessage = this.onMessage.bind(this);
  }
  init() {
    const token = useToken();
    const socket = new SockJS(this.url);
    const stompOptions = { debug: false };
    this.stomp = Stomp.over(socket, stompOptions);
    const headers = { token: token.split(' ')[1] };
    this.stomp.connect(headers, this.onConnectSuccess, this.onConnectError);
    this.registerEvents(codeEvents);
  }
  registerEvents(events: IMsgAction[]) {
    const eventsMap: any = {};
    events.forEach((e) => {
      eventsMap[e.code] = e;
    });
    this.eventsMap = eventsMap;
  }
  onConnectSuccess() {
    console.log('socket-connect-success');
    if (!this.stomp || !this.stomp.connected) return;
    const { user, team } = this.editor.bsState;
    this.stomp.subscribe(`/basicai/topic/team/${team.id}`, this.onMessage);
    this.stomp.subscribe(`/basicai/topic/user/${user.id}`, this.onMessage);
  }
  onConnectError(err: any) {
    console.log('socket ConnectError:', err);
    if (this.stomp) this.stomp.disconnect();
    this.editor.emit(Event.SOCKET_CONNECT_ERROR, err);
    setTimeout(() => {
      console.log('socket-reconnect......');
      this.init();
    }, 60 * 1000);
  }
  onConnectClose() {
    console.log('==================> socket ConnectClosed');
  }
  async onMessage(msg: Message) {
    const body = JSON.parse(msg.body) as IMsgBody;
    console.log('socket message body:', body);
    const { code } = body;
    const action = this.eventsMap[code];
    const actionValid = action && action.valid(this, body);
    console.log('onMessage actionValid:', actionValid);
    if (actionValid) {
      await action?.execute(this, body);
      this.editor.emit(code, body);
    }
  }
  async showConfirm(data: IMsgBody) {
    const { content, title } = this.getContentText(data);
    const btns = data.buttons || [];
    const okText = btns[1]?.content || '';
    const cancelText = btns[0]?.content || '';
    return await this.editor.showConfirm({
      title,
      subTitle: content,
      okText: this.editor.tI(okText),
      cancelText: this.editor.tI(cancelText),
    });
  }
  async showModal(data: IMsgBody) {
    const { content, title } = this.getContentText(data);
    return await this.editor
      .showModal('confirm', {
        title: '',
        data: {
          content: title,
          subContent: content,
          buttons: data.buttons || defaultBtns,
        },
      })
      .catch(() => {});
  }
  getContentText(data: IMsgBody) {
    const { content = {}, title = {} } = data;
    const lang = this.editor.state.lang;
    const langMap = {
      [LangType['ko-KR']]: 'ko',
      [LangType['zh-CN']]: 'zh_CN',
      [LangType['en-US']]: 'en',
      [LangType['ar-AE']]: 'ar_AE',
    };
    return {
      content: content[langMap[lang] || LangType['en-US']],
      title: title[langMap[lang] || LangType['en-US']],
    };
  }
  get url() {
    if (!this._url) {
      // const host = location.hostname || location.host;
      const baseUrl = location.origin;
      // const baseUrl = 'https://' + host.replace('tool', 'app');
      // if (import.meta.env.DEV) {
      //   baseUrl = 'https://app.alidev.beisai.com';
      // }
      this._url = baseUrl + '/websocket/stomp';
    }
    return this._url;
  }
}

export default SocketManager;
