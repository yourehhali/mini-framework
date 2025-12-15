export class Renderer {
  constructor({ reconciler, factory, hooks, eventBus }) {
    this.reconciler = reconciler;
    this.factory = factory;
    this.hooks = hooks;
    this.eventBus = eventBus || null;
    this.rootComponent = null;
    this.container = null;
    this.currentVNode = null;
  }

  mount(component, container) {
    this.rootComponent = component;
    this.container = container;
    // Attach event bus to the root so it can install one handler per type
    // (e.g., container.onclick) when the first handler is registered.
    if (this.eventBus) this.eventBus.attachRoot(container);
    this.hooks.resetIndices();
    const vnode = this.rootComponent();
    this.container.innerHTML = '';
    const el = this.factory.create(vnode, false);
    this.container.appendChild(el);
    this.currentVNode = vnode;
    this.hooks.runEffects();
  }

  rerender() {
    switch (true) {
      case !this.rootComponent || !this.container:
        return;
      default:
        this.hooks.resetIndices();
        const next = this.rootComponent();
        this.reconciler.diff(this.container, this.currentVNode, next, 0);
        this.currentVNode = next;
        this.hooks.runEffects();
    }
  }

  unmount() {
    switch (true) {
      case !this.container:
        return;
      default:
        this.container.innerHTML = '';
        this.hooks.cleanup();
        // Detach event bus and clear root-level property handlers.
        if (this.eventBus) this.eventBus.detachRoot();
        this.rootComponent = null;
        this.container = null;
        this.currentVNode = null;
    }
  }
}
