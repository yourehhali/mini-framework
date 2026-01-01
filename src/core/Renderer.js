
import { VDom } from './vdom/VDom.js';
import { Diffing } from './vdom/Diffing.js';
import { Hooks } from './hooks/Hooks.js';

export class Renderer {
    constructor() {
        this.vdom = new VDom();
        this.diffing = new Diffing(this.vdom);
        this.hooks = new Hooks(this.scheduleUpdate.bind(this));
        
        this.rootContainer = null;
        this.rootComponent = null;
        this.oldVNodeList = [];
        this.isRendering = false;
    }

    render(component, container) {
        this.rootComponent = component;
        this.rootContainer = container;
        this.hooks.clear();
        this.oldVNodeList = [];
        this.renderApp();
    }

    scheduleUpdate() {
        if (!this.isRendering) {
            this.isRendering = true;
            queueMicrotask(() => this.renderApp());
        }
    }

    renderApp() {
        this.hooks.reset();
        
        const vnode = this.rootComponent();
        const newList = this.resolve(vnode);
        
        this.diffing.diff(this.rootContainer, this.oldVNodeList, newList);
        
        this.oldVNodeList = newList;
        this.hooks.runEffects();
        this.isRendering = false;
    }

    resolve(vnode) {
        if (vnode === null || vnode === undefined || vnode === false) return [];
        
        switch (true) {
            case Array.isArray(vnode):
                return vnode.flatMap(v => this.resolve(v));
            
            case typeof vnode === 'string':
            case typeof vnode === 'number':
                return [String(vnode)];
                
            case !!vnode.component:
                return this.resolveComponent(vnode);
                
            case vnode.tag === 'fragment':
                return (vnode.children || []).flatMap(v => this.resolve(v));
                
            default:
                return [this.createStandardVNode(vnode)];
        }
    }

    resolveComponent(vnode) {
        const { component: Component, props } = vnode;
        let rendered;
        
        if (Component.prototype && Component.prototype.render) {
            const instance = new Component(props || {});
            rendered = instance.render();
        } else {
            rendered = Component(props || {});
        }
        
        const resolved = this.resolve(rendered);
        this.propagateKeys(resolved, props);
        return resolved;
    }

    propagateKeys(resolved, props) {
        if (props && props.key !== undefined) {
            resolved.forEach(item => {
                if (typeof item === 'object') {
                    item.attrs = item.attrs || {};
                    if (item.attrs.key === undefined) {
                        item.attrs.key = props.key;
                    }
                }
            });
        }
    }

    createStandardVNode(vnode) {
        const resolvedChildren = (vnode.children || []).flatMap(v => this.resolve(v));
        return {
            tag: vnode.tag,
            attrs: vnode.attrs,
            children: resolvedChildren
        };
    }
    
    // Hooks proxy methods
    useState(initialValue) {
        return this.hooks.useState(initialValue);
    }

    useEffect(callback, deps) {
        return this.hooks.useEffect(callback, deps);
    }
}

// Singleton instance
export const renderer = new Renderer();
