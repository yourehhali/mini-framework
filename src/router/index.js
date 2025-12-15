import { useState, useEffect } from '../api/index.js';

function parseQuery(search) {
  const params = {};
  const qs = search.startsWith('?') ? search.slice(1) : search;
  if (!qs) return params;
  qs.split('&').forEach(p => {
    const [k, v = ''] = p.split('=');
    params[decodeURIComponent(k)] = decodeURIComponent(v);
  });
  return params;
}

function pathToRegex(path) {
  const keys = [];
  const pattern = path.replace(/\/:([^/]+)/g, (_, k) => {
    keys.push(k);
    return '/([^/]+)';
  }).replace(/\//g, '\\/');
  const regex = new RegExp(`^${pattern}$`);
  return { regex, keys };
}

function match(routes, pathname) {
  for (const r of routes) {
    const { regex, keys } = pathToRegex(r.path);
    const m = pathname.match(regex);
    if (m) {
      const params = {};
      keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      return { route: r, params };
    }
  }
  return null;
}

function buildQueryRoute(base, to) {
  const u = new URL(location.href);
  u.pathname = base || u.pathname;
  const q = parseQuery(u.search);
  q.r = to;
  const qs = Object.keys(q).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(q[k])}`).join('&');
  u.search = qs ? `?${qs}` : '';
  return u;
}

function getQueryRoute() {
  const q = parseQuery(location.search);
  return typeof q.r === 'string' ? q.r : '/';
}

function createRouter({ routes, base = '', mode = 'query' } = {}) {
  let listeners = [];
  let current = { path: '/', params: {}, query: parseQuery(location.search) };

  function notify() {
    listeners.forEach(fn => fn(current));
  }

  function readPath() {
    if (mode === 'query') return getQueryRoute();
    const b = base && location.pathname.startsWith(base) ? base.length : 0;
    const p = location.pathname.slice(b) || '/';
    return p;
  }

  function navigate(to, replace = false) {
    if (mode === 'query') {
      const u = buildQueryRoute(base, to);
      if (replace) history.replaceState({}, '', u);
      else history.pushState({}, '', u);
      update();
      return;
    }
    const b = base || '';
    const next = `${b}${to}`.replace(/\/{2,}/g, '/');
    const u = new URL(location.href);
    u.pathname = next;
    if (replace) history.replaceState({}, '', u);
    else history.pushState({}, '', u);
    update();
  }

  function update() {
    const path = readPath();
    const m = match(routes, path) || { route: null, params: {} };
    current = { path, params: m.params || {}, query: parseQuery(location.search), meta: m.route || null };
    notify();
  }

  function start() {
    queueMicrotask(update);
    addEventListener('popstate', update);
  }

  function onChange(fn) {
    listeners.push(fn);
    try { fn(current); } catch (_) {}
    return () => { listeners = listeners.filter(x => x !== fn); };
  }

  return { routes, base, mode, start, navigate, onChange, readPath };
}

function useRoute(router) {
  const [state, setState] = useState({ path: '/', params: {}, query: {} });
  useEffect(() => {
    const off = router.onChange(s => setState(s));
    router.start();
    return () => off();
  }, []);
  return state;
}

function RouterView({ router, fallback }) {
  const route = useRoute(router);
  const m = match(router.routes, route.path);
  if (!m || !m.route) return fallback || { tag: 'div', attrs: {}, children: [] };
  const C = m.route.component;
  return { component: C, props: { params: route.params, query: route.query, key: route.path } };
}

function Link({ router, to, attrs = {}, children = [] }) {
  const href = router.mode === 'query' ? buildQueryRoute(router.base, to).toString() : `${router.base}${to}`;
  const onClick = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    router.navigate(to);
  };
  return { tag: 'a', attrs: { href, onClick, ...(attrs || {}) }, children: Array.isArray(children) ? children : [children] };
}

export { createRouter, useRoute, RouterView, Link };
