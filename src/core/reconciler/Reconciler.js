import { isTextNode, isSameNodeType } from '../../utils/NodeUtils.js';

export class Reconciler {
  constructor({ factory }) {
    this.factory = factory;
  }

  diff(parentDom, oldVNode, newVNode, index = 0) {
    switch (true) {
      case !newVNode && !oldVNode:
        return;
      case !newVNode: {
        const child = parentDom.childNodes[index];
        if (child) parentDom.removeChild(child);
        return;
      }
      default:
        break;
    }

    oldVNode = oldVNode ? this.resolve(oldVNode) : null;
    newVNode = this.resolve(newVNode);

    switch (true) {
      case oldVNode?.tag === 'fragment' && newVNode?.tag === 'fragment':
        this.diffChildren(parentDom, oldVNode.children || [], newVNode.children || []);
        return;
      case newVNode?.tag === 'fragment': {
        if (oldVNode) {
          const child = parentDom.childNodes[index];
          if (child) parentDom.removeChild(child);
        }
        let current = index;
        (newVNode.children || []).forEach(child => {
          this.diff(parentDom, null, child, current++);
        });
        return;
      }
      case oldVNode?.tag === 'fragment': {
        const count = (oldVNode.children || []).length;
        for (let i = 0; i < count; i++) {
          const child = parentDom.childNodes[index];
          if (child) parentDom.removeChild(child);
        }
        this.diff(parentDom, null, newVNode, index);
        return;
      }
      case !oldVNode: {
        parentDom.appendChild(this.factory.create(newVNode));
        return;
      }
      default:
        break;
    }

    const domNode = parentDom.childNodes[index];
    if (!domNode) {
      parentDom.appendChild(this.factory.create(newVNode));
      return;
    }

    switch (true) {
      case isTextNode(oldVNode) && isTextNode(newVNode):
        if (oldVNode !== newVNode) domNode.nodeValue = newVNode.toString();
        return;
      case !isSameNodeType(oldVNode, newVNode): {
        const newDom = this.factory.create(newVNode);
        parentDom.replaceChild(newDom, domNode);
        return;
      }
      default:
        this.factory.setUpdatedAttributes(domNode, oldVNode.attrs, newVNode.attrs);
        this.diffChildren(domNode, oldVNode.children || [], newVNode.children || []);
    }
  }

  diffChildren(parentDom, oldChildren, newChildren) {
    const filter = v => v !== null && v !== undefined && v !== false;
    oldChildren = this.expandFragments(oldChildren.map(c => this.resolve(c))).filter(filter);
    newChildren = this.expandFragments(newChildren.map(c => this.resolve(c))).filter(filter);

    switch (true) {
      case oldChildren.length === 0 && newChildren.length === 0:
        return;
      case newChildren.length === 0:
        parentDom.innerHTML = '';
        return;
      case oldChildren.length === 0:
        newChildren.forEach(child => parentDom.appendChild(this.factory.create(child)));
        return;
      default:
        break;
    }

    const hasKeys = oldChildren.some(c => c?.attrs?.key) || newChildren.some(c => c?.attrs?.key);
    if (!hasKeys) {
      let offset = 0;
      const max = Math.max(oldChildren.length, newChildren.length);
      for (let i = 0; i < max; i++) {
        const domIndex = i - offset;
        if (oldChildren[i] && !newChildren[i]) offset++;
        this.diff(parentDom, oldChildren[i], newChildren[i], domIndex);
      }
      return;
    }

    const nodeMap = new Map();
    const domNodes = Array.from(parentDom.childNodes);
    oldChildren.forEach((child, i) => {
      const k = child?.attrs?.key;
      if (k && i < domNodes.length) nodeMap.set(k, { vnode: child, dom: domNodes[i] });
    });

    const used = new Set();
    let cursor = 0;
    newChildren.forEach(newChild => {
      const k = newChild?.attrs?.key;
      const old = k && nodeMap.get(k);
      switch (true) {
        case !!old: {
          const { vnode: oVNode, dom: oDom } = old;
          used.add(oDom);
          this.factory.setUpdatedAttributes(oDom, oVNode.attrs, newChild.attrs);
          this.diffChildren(oDom, oVNode.children || [], newChild.children || []);
          const pos = parentDom.childNodes[cursor];
          if (pos !== oDom) parentDom.insertBefore(oDom, pos || null);
          break;
        }
        default: {
          const nDom = this.factory.create(newChild);
          parentDom.insertBefore(nDom, parentDom.childNodes[cursor] || null);
        }
      }
      cursor++;
    });

    domNodes.forEach(d => {
      if (!used.has(d) && d.parentNode === parentDom) parentDom.removeChild(d);
    });
  }

  expandFragments(children) {
    const result = [];
    children.forEach(child => {
      const c = this.resolve(child);
      switch (true) {
        case c?.tag === 'fragment':
          result.push(...this.expandFragments(c.children || []));
          break;
        case c !== null && c !== undefined && c !== false:
          result.push(c);
          break;
        default:
          break;
      }
    });
    return result;
  }

  resolve(vnode) {
    switch (true) {
      case !vnode:
        return null;
      case !!vnode.component: {
        let res;
        const C = vnode.component;
        if (typeof C === 'function' && C.prototype && typeof C.prototype.render === 'function') {
          const inst = new C(vnode.props || {});
          res = inst.render();
        } else {
          res = C(vnode.props || {});
        }
        if (vnode.props && vnode.props.key && res && res.attrs && !res.attrs.key) res.attrs.key = vnode.props.key;
        return res;
      }
      default:
        return vnode;
    }
  }
}
