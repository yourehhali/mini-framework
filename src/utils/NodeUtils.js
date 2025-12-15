export function isTextNode(node) {
  return typeof node === 'string' || typeof node === 'number';
}

export function isSameNodeType(a, b) {
  switch (true) {
    case !a || !b:
      return false;
    case isTextNode(a) && isTextNode(b):
      return true;
    case isTextNode(a) || isTextNode(b):
      return false;
    default:
      return a.tag === b.tag;
  }
}
