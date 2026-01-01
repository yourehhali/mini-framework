
export class Diffing {
    constructor(vdom) {
        this.vdom = vdom;
    }

    diff(parent, oldList, newList) {
        const minLen = Math.min(oldList.length, newList.length);
        
        for (let i = 0; i < minLen; i++) {
            this.diffNode(parent, oldList[i], newList[i], parent.childNodes[i]);
        }
        
        this.handleExcessNodes(parent, oldList, newList, minLen);
    }

    diffNode(parent, oldVNode, newVNode, domNode) {
        const oldKey = this.getKey(oldVNode);
        const newKey = this.getKey(newVNode);

        switch (true) {
            case oldKey !== newKey:
            case typeof oldVNode !== typeof newVNode:
            case typeof oldVNode === 'string' && oldVNode !== newVNode:
            case typeof oldVNode === 'object' && oldVNode.tag !== newVNode.tag:
                this.replaceNode(parent, newVNode, domNode);
                break;
            case typeof oldVNode === 'object':
                this.updateNode(domNode, oldVNode, newVNode);
                break;
        }
    }

    getKey(vnode) {
        return (typeof vnode === 'object' && vnode !== null) ? vnode.attrs?.key : undefined;
    }

    replaceNode(parent, newVNode, domNode) {
        if (domNode) {
            parent.replaceChild(this.vdom.createDom(newVNode), domNode);
        } else {
            parent.appendChild(this.vdom.createDom(newVNode));
        }
    }

    updateNode(domNode, oldVNode, newVNode) {
        this.updateAttributes(domNode, oldVNode.attrs || {}, newVNode.attrs || {});
        this.diff(domNode, oldVNode.children || [], newVNode.children || []);
    }

    handleExcessNodes(parent, oldList, newList, minLen) {
        switch (true) {
            case newList.length > oldList.length:
                this.addNodes(parent, newList, oldList.length);
                break;
            case oldList.length > newList.length:
                this.removeNodes(parent, oldList.length, minLen);
                break;
        }
    }

    addNodes(parent, newList, startIndex) {
        for (let i = startIndex; i < newList.length; i++) {
            parent.appendChild(this.vdom.createDom(newList[i]));
        }
    }

    removeNodes(parent, endIndex, startIndex) {
        for (let i = endIndex - 1; i >= startIndex; i--) {
            const child = parent.childNodes[i];
            if (child) parent.removeChild(child);
        }
    }

    updateAttributes(el, oldAttrs, newAttrs) {
        const oldKeys = Object.keys(oldAttrs);
        const newKeys = Object.keys(newAttrs);
        
        oldKeys.forEach(key => {
            if (!(key in newAttrs) || (key.startsWith('on') && oldAttrs[key] !== newAttrs[key])) {
                this.vdom.removeAttribute(el, key, oldAttrs[key]);
            }
        });
        
        newKeys.forEach(key => {
            switch (true) {
                case key.startsWith('on'):
                    if (oldAttrs[key] !== newAttrs[key]) {
                        this.vdom.setAttribute(el, key, newAttrs[key]);
                    }
                    break;
                case key === 'value':
                case key === 'checked':
                case oldAttrs[key] !== newAttrs[key]:
                    this.vdom.setAttribute(el, key, newAttrs[key]);
                    break;
            }
        });
    }
}
