export class HookManager {
  constructor({ scheduler, onUpdate }) {
    this.scheduler = scheduler;
    this.onUpdate = onUpdate;
    this.states = [];
    this.stateIndex = 0;
    this.effectDeps = [];
    this.effectCleanups = [];
    this.effectIndex = 0;
    this.refs = [];
    this.refIndex = 0;
    this.isFirstRender = true;
  }

  useState(initialValue) {
    const i = this.stateIndex;
    if (this.states[i] === undefined) this.states[i] = initialValue;
    const current = this.states[i];
    const setState = (next) => {
      const val = typeof next === 'function' ? next(this.states[i]) : next;
      if (this.states[i] !== val) {
        this.states[i] = val;
        this.onUpdate && this.onUpdate();
      }
    };
    this.stateIndex++;
    return [current, setState];
  }

  useEffect(callback, deps) {
    const i = this.effectIndex;
    const prev = this.effectDeps[i];
    let shouldRun = false;
    switch (true) {
      case deps === undefined:
        shouldRun = true; break;
      case prev === undefined:
        shouldRun = true; break;
      case deps.length === 0 && prev.length === 0:
        shouldRun = this.isFirstRender || prev === undefined; break;
      case deps.length !== prev.length:
        shouldRun = true; break;
      default:
        shouldRun = deps.some((d, idx) => !Object.is(d, prev[idx]));
    }
    if (shouldRun) {
      this.scheduler.queue(() => {
        const cleanup = this.effectCleanups[i];
        if (typeof cleanup === 'function') cleanup();
        const nextCleanup = callback();
        this.effectCleanups[i] = typeof nextCleanup === 'function' ? nextCleanup : undefined;
      });
    }
    this.effectDeps[i] = deps;
    this.effectIndex++;
  }

  useRef(initialValue) {
    const i = this.refIndex;
    if (this.refs[i] === undefined) this.refs[i] = { current: initialValue };
    this.refIndex++;
    return this.refs[i];
  }

  resetIndices() {
    this.stateIndex = 0;
    this.effectIndex = 0;
    this.refIndex = 0;
  }

  runEffects() {
    this.scheduler.flush();
    this.isFirstRender = false;
  }

  cleanup() {
    this.effectCleanups.forEach(fn => { if (typeof fn === 'function') fn(); });
    this.states.length = 0;
    this.effectDeps.length = 0;
    this.effectCleanups.length = 0;
    this.refs.length = 0;
    this.resetIndices();
    this.isFirstRender = true;
  }
}
