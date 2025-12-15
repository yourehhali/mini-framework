import { Renderer } from '../core/renderer/Renderer.js';
import { Reconciler } from '../core/reconciler/Reconciler.js';
import { ElementFactory } from '../core/vnode/ElementFactory.js';
import { HookManager } from '../core/hooks/HookManager.js';
import { EffectScheduler } from '../scheduler/EffectScheduler.js';
import { EventBus } from '../events/EventBus.js';

// Initialize core singletons:
// - EffectScheduler queues and flushes side effects
// - EventBus delegates DOM events via root property handlers (not addEventListener)
// - ElementFactory constructs DOM nodes and wires attrs/events
// - Reconciler performs virtual DOM diffing using the factory
const scheduler = new EffectScheduler();
const eventBus = new EventBus();
const factory = new ElementFactory({ eventBus });
const reconciler = new Reconciler({ factory });
let renderer;
let hooks;

function ensureInit() {
  switch (true) {
    case !hooks && !renderer: {
      // HookManager calls onUpdate after state changes; onUpdate triggers rerender.
      hooks = new HookManager({ scheduler, onUpdate: () => renderer && renderer.rerender() });
      // Renderer coordinates diffing and mounts/unmounts; inject EventBus to handle events.
      renderer = new Renderer({ reconciler, factory, hooks, eventBus });
      break;
    }
    default: break;
  }
}

function render(component, container) {
  ensureInit();
  renderer.mount(component, container);
}

function unmount() {
  ensureInit();
  renderer.unmount();
}

function useState(initialValue) {
  ensureInit();
  return hooks.useState(initialValue);
}

function useEffect(callback, deps) {
  ensureInit();
  return hooks.useEffect(callback, deps);
}

function useRef(initialValue) {
  ensureInit();
  return hooks.useRef(initialValue);
}

export { render, unmount, useState, useEffect, useRef };
