
import { useState, useEffect, h } from '../core/framework.js';

export class Router {
    constructor(routes = []) {
        this.routes = routes;
        this.currentPath = window.location.hash.slice(1) || '/';
        this.listeners = [];
        this.handleHashChange = this.handleHashChange.bind(this);
        window.addEventListener('hashchange', this.handleHashChange);
    }

    handleHashChange() {
        this.currentPath = window.location.hash.slice(1) || '/';
        const match = this.match(this.currentPath);
        this.notify(match);
    }

    match(path) {
        return this.routes.find(route => route.path === path);
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify(match) {
        this.listeners.forEach(listener => listener(this.currentPath, match));
    }

    push(path) {
        window.location.hash = path;
    }

    static useHash() {
        const [hash, setHash] = useState(window.location.hash.slice(1) || '/');
        
        useEffect(() => {
            const handler = () => {
                setHash(window.location.hash.slice(1) || '/');
            };
            window.addEventListener('hashchange', handler);
            return () => window.removeEventListener('hashchange', handler);
        }, []);
        
        return hash;
    }
}

export const useHash = Router.useHash;

export function createRouter(options) {
    return new Router(options.routes);
}

export const Link = ({ to, children, ...props }) => {
    return {
        tag: 'a',
        attrs: {
            href: `#${to}`,
            ...props
        },
        children: children
    };
}
