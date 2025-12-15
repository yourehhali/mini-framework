function toKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function buildCss(namespace, rules) {
  const parts = [];
  Object.entries(rules).forEach(([name, styleObj]) => {
    const cls = `${namespace}__${name}`;
    const body = Object.entries(styleObj)
      .map(([k, v]) => `${toKebab(k)}:${v}`)
      .join(';');
    parts.push(`.${cls}{${body}}`);
  });
  return parts.join('\n');
}

function inject(namespace, cssText) {
  const id = `style-module-${namespace}`;
  let tag = document.querySelector(`style#${id}`);
  if (!tag) {
    tag = document.createElement('style');
    tag.id = id;
    tag.textContent = cssText;
    document.head.appendChild(tag);
  } else {
    tag.textContent = cssText;
  }
}

function createStyleModule(namespace, rules) {
  const css = buildCss(namespace, rules);
  inject(namespace, css);
  const classes = {};
  Object.keys(rules).forEach(name => {
    classes[name] = `${namespace}__${name}`;
  });
  return classes;
}

export { createStyleModule };
