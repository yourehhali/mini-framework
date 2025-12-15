import { parseAttr } from '../../utils/AttrUtils.js';

export class ElementFactory {
  constructor({ eventBus } = {}) {
    // Optional EventBus instance used to register synthetic event handlers
    // during attribute application (without addEventListener).
    this.eventBus = eventBus || null;
  }
  create(vnode, isSvg = false) {
    switch (true) {
      case typeof vnode === 'string' || typeof vnode === 'number':
        return document.createTextNode(vnode.toString());
      case !vnode:
        return document.createTextNode('');
      case !!vnode.component: {
        const C = vnode.component;
        let res;
        if (typeof C === 'function' && C.prototype && typeof C.prototype.render === 'function') {
          const inst = new C(vnode.props || {});
          res = inst.render();
        } else {
          res = C(vnode.props || {});
        }
        return this.create(res, isSvg);
      }
      case vnode.tag === 'fragment': {
        const frag = document.createDocumentFragment();
        (vnode.children || []).forEach(child => {
          if (child === null || child === undefined) return;
          frag.appendChild(this.create(child, isSvg));
        });
        return frag;
      }
      default: {
        const nextIsSvg = isSvg || vnode.tag === 'svg';
        const el = nextIsSvg
          ? document.createElementNS('http://www.w3.org/2000/svg', vnode.tag)
          : document.createElement(vnode.tag);
        if (vnode.attrs && vnode.attrs.key) el.setAttribute('data-key', vnode.attrs.key);
        if (vnode.attrs) this.setInitialAttributes(el, vnode.attrs);
        (vnode.children || []).forEach(child => {
          if (child === null || child === undefined) return;
          el.appendChild(this.create(child, nextIsSvg));
        });
        return el;
      }
    }
  }

  setInitialAttributes(element, attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'key') return;
      switch (true) {
        case key.startsWith('on') && typeof value === 'function': {
          // Register the event handler with the EventBus instead of
          // binding directly via addEventListener.
          if (this.eventBus) {
            const type = key.slice(2).toLowerCase();
            this.eventBus.register(element, type, value);
          }
          break;
        }
        case key === 'style' && typeof value === 'object': {
          Object.entries(value).forEach(([k, v]) => { element.style[k] = v; });
          break;
        }
        default: {
          const isSvg = typeof SVGElement !== 'undefined' && element instanceof SVGElement;
          if (isSvg) {
            const parsed = parseAttr(key);
            if (parsed.ns) element.setAttributeNS(parsed.ns, parsed.localName, value);
            else element.setAttribute(key, value);
          } else {
            if (key === 'class' || key.startsWith('data-')) element.setAttribute(key, value);
            else {
              try { element[key] = value; } catch (_) { element.setAttribute(key, value); }
            }
          }
        }
      }
    });
  }

  setUpdatedAttributes(element, oldAttrs, newAttrs) {
    const oldMap = oldAttrs || {};
    const newMap = newAttrs || {};

    Object.keys(oldMap).forEach(attr => {
      if (attr === 'key') return;
      if (attr in newMap) return;
      switch (true) {
        case attr.startsWith('on'): {
          // Unregister removed event handlers from the EventBus.
          if (this.eventBus) {
            const type = attr.slice(2).toLowerCase();
            this.eventBus.unregister(element, type);
          }
          break;
        }
        case attr === 'style': {
          element.style = '';
          break;
        }
        default: {
          const isSvg = typeof SVGElement !== 'undefined' && element instanceof SVGElement;
          if (isSvg) {
            const parsed = parseAttr(attr);
            if (parsed.ns) { try { element.removeAttributeNS(parsed.ns, parsed.localName); } catch (_) {} }
            else element.removeAttribute(attr);
          } else {
            if (attr === 'class' || attr.startsWith('data-')) element.removeAttribute(attr);
            else {
              try { element[attr] = undefined; } catch (_) { element.removeAttribute(attr); }
            }
          }
        }
      }
    });

    Object.entries(newMap).forEach(([attr, value]) => {
      if (attr === 'key') return;
      const oldValue = oldMap[attr];
      if (oldValue === value) return;
      switch (true) {
        case attr.startsWith('on') && typeof value === 'function': {
          // Re-register updated event handlers with the EventBus to ensure
          // the latest function is used during dispatch.
          if (this.eventBus) {
            const type = attr.slice(2).toLowerCase();
            this.eventBus.register(element, type, value);
          }
          break;
        }
        case attr === 'style' && typeof value === 'object': {
          const oldStyle = oldMap.style || {};
          Object.keys(oldStyle).forEach(k => { if (value[k] === undefined) element.style[k] = ''; });
          Object.entries(value).forEach(([k, v]) => { if (oldStyle[k] !== v) element.style[k] = v; });
          break;
        }
        default: {
          const isSvg = typeof SVGElement !== 'undefined' && element instanceof SVGElement;
          if (isSvg) {
            const parsed = parseAttr(attr);
            if (parsed.ns) element.setAttributeNS(parsed.ns, parsed.localName, value);
            else element.setAttribute(attr, value);
          } else {
            if (attr === 'class' || attr.startsWith('data-')) element.setAttribute(attr, value);
            else {
              try { element[attr] = value; } catch (_) { element.setAttribute(attr, value); }
            }
          }
        }
      }
    });
  }
}
