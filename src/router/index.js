
import { useState, useEffect, h } from '../core/framework.js';

export class Router {
    constructor(routes = []) {
        this.routes = routes;
        window.addEventListener('hashchange', this.handleHashChange.bind(this));
    }

    handleHashChange() {
        // Can be extended to handle route matching logic if needed
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

