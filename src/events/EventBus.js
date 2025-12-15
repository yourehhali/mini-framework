// Centralized event delegation without using addEventListener.
// Installs one handler per event type on the root container via property assignment
// (e.g., container.onclick = dispatcher). Handlers are registered against specific
// elements and dispatched by walking up from event.target to the root.
export class EventBus {
  constructor() {
    this.rootContainer = null;
    this.handlersByType = new Map();
    this.installedTypes = new Set();
  }
  attachRoot(container) {
    this.rootContainer = container;
  }
  detachRoot() {
    if (!this.rootContainer) return;
    // Remove all installed root property handlers to avoid leaks.
    this.installedTypes.forEach(type => {
      const rootHandlerProp = 'on' + type;
      this.rootContainer[rootHandlerProp] = null;
    });
    this.installedTypes.clear();
    this.rootContainer = null;
  }
  register(element, type, handler) {
    // Keep a WeakMap of element->handler per event type.
    let typeHandlers = this.handlersByType.get(type);
    if (!typeHandlers) {
      typeHandlers = new WeakMap();
      this.handlersByType.set(type, typeHandlers);
    }
    typeHandlers.set(element, handler);
    // Lazy-install a single root dispatcher for this type.
    if (this.rootContainer && !this.installedTypes.has(type)) {
      const rootHandlerProp = 'on' + type;
      this.rootContainer[rootHandlerProp] = event => this.dispatch(type, event);
      this.installedTypes.add(type);
    }
  }
  unregister(element, type) {
    // Remove a specific element handler for a given type.
    const typeHandlers = this.handlersByType.get(type);
    if (typeHandlers) typeHandlers.delete(element);
  }
  dispatch(type, event) {
    // Walk up from the event target until the root, invoking the first
    // handler found for the given type on each ancestor. Stop on explicit
    // false return or when a handler sets e.__eventBusStop.
    const typeHandlers = this.handlersByType.get(type);
    if (!typeHandlers || !this.rootContainer) return;
    let currentNode = event.target;
    while (currentNode) {
      const handler = typeHandlers.get(currentNode);
      if (typeof handler === 'function') {
        const result = handler(event);
        if (result === false || event.__eventBusStop) break;
      }
      if (currentNode === this.rootContainer) break;
      currentNode = currentNode.parentNode;
    }
  }
}
