
export class Hooks {
    constructor(scheduler) {
        this.hooks = [];
        this.hookIndex = 0;
        this.scheduler = scheduler;
        this.effectsToRun = [];
    }

    useState(initialValue) {
        const index = this.hookIndex++;
        if (this.hooks[index] === undefined) {
            this.hooks[index] = initialValue;
        }

        const setState = (newValue) => {
            const value = typeof newValue === 'function' ? newValue(this.hooks[index]) : newValue;
            if (this.hooks[index] !== value) {
                this.hooks[index] = value;
                this.scheduler();
            }
        };

        return [this.hooks[index], setState];
    }

    useEffect(callback, deps) {
        const index = this.hookIndex++;
        const oldEffect = this.hooks[index];
        
        if (this.hasDepsChanged(oldEffect, deps)) {
            this.effectsToRun.push(() => {
                if (oldEffect && oldEffect.cleanup) oldEffect.cleanup();
                const cleanup = callback();
                this.hooks[index] = { deps, cleanup };
            });
        }
    }

    hasDepsChanged(oldEffect, deps) {
        return !oldEffect || !deps || !oldEffect.deps || 
               (deps.length !== oldEffect.deps.length) ||
               deps.some((d, i) => d !== oldEffect.deps[i]);
    }

    reset() {
        this.hookIndex = 0;
        this.effectsToRun = [];
    }

    runEffects() {
        this.effectsToRun.forEach(effect => effect());
        this.effectsToRun = [];
    }

    clear() {
        this.hooks = [];
        this.reset();
    }
}
