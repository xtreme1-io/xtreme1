export default class Action {
  actionName!: string;
  enabled: boolean = true;
  constructor() {}
  init() {}
  destroy() {}
  toggle(enabled: boolean) {
    this.enabled = enabled;
  }
  isEnable(): boolean {
    return this.enabled;
  }
}
