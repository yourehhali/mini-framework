export class EffectScheduler {
  constructor() {
    this.queueList = [];
  }
  queue(effect) {
    this.queueList.push(effect);
  }
  flush() {
    const list = [...this.queueList];
    this.queueList.length = 0;
    list.forEach(fn => fn());
  }
}
