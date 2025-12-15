export class Component {
  constructor() {
    this.state = {};
  }
  setState(partial, onUpdate) {
    this.state = { ...this.state, ...partial };
    if (typeof onUpdate === 'function') onUpdate();
  }
  render() {
    return null;
  }
}
