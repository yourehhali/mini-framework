
export class VDom {
    static h(tag, attrs, children) {
        return { tag, attrs: attrs || {}, children: children || [] };
    }

    createDom(vnode) {
        switch (typeof vnode) {
            case 'string':
            case 'number':
                return document.createTextNode(String(vnode));
            case 'object':
                if (vnode === null) return document.createTextNode('');
                return this.createElement(vnode);
            default:
                return document.createTextNode('');
        }
    }

    createElement(vnode) {
        const el = document.createElement(vnode.tag);
        
        if (vnode.attrs) {
            this.setAttributes(el, vnode.attrs);
        }
        
        if (vnode.children) {
            vnode.children.forEach(child => {
                el.appendChild(this.createDom(child));
            });
        }
        
        return el;
    }

    setAttributes(el, attrs) {
        Object.keys(attrs).forEach(name => {
            this.setAttribute(el, name, attrs[name]);
        });
    }

    setAttribute(el, name, value) {
        switch (true) {
            case name.startsWith('on') && typeof value === 'function':
                this.addUnknownEventListener(el, name, value);
                break;
            case name === 'value' || name === 'checked':
                el[name] = value;
                break;
            case name === 'className' || name === 'class':
                el.setAttribute('class', value);
                break;
            case name === 'htmlFor':
                el.setAttribute('for', value);
                break;
            case name === 'style' && typeof value === 'object':
                Object.assign(el.style, value);
                break;
            case value === false:
                el.removeAttribute(name);
                break;
            default:
                el.setAttribute(name, value);
        }
    }
    
    removeAttribute(el, name, value) {
        switch (true) {
            case name.startsWith('on') && typeof value === 'function':
                this.removeUnknownEventListener(el, name, value);
                break;
            case name === 'value' || name === 'checked':
                el[name] = '';
                break;
            case name === 'className' || name === 'class':
                el.removeAttribute('class');
                break;
            case name === 'htmlFor':
                el.removeAttribute('for');
                break;
            case name === 'style':
                el.style.cssText = '';
                break;
            default:
                el.removeAttribute(name);
        }
    }
    
    addUnknownEventListener(el, name, value) {
        el[name.toLowerCase()] = value;
    }

    removeUnknownEventListener(el, name, value) {
        el[name.toLowerCase()] = null;
    }
}
