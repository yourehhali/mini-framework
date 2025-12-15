const NS = {
  xlink: 'http://www.w3.org/1999/xlink',
  xml: 'http://www.w3.org/XML/1998/namespace'
};

export function parseAttr(attr) {
  if (attr.includes(':')) {
    const [prefix, localName] = attr.split(':');
    const ns = NS[prefix] || null;
    return { ns, localName };
  }
  return { ns: null, localName: attr };
}

export { NS };
