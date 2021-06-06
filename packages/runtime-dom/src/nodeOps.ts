export const nodeOps = {
  createElement: tagName => document.createElement(tagName),
  remove: child => {
    const parent = child.parentElement;
    if (parent) {
      parent.removeChild(child);
    }
  },
  insert: (child, parent, anchor = null) => {
    parent.insertBefore(child, anchor);
  },
  setElementText: (el: Element, text: string) => {
    el.textContent = text;
  },
  createText: text => document.createTextNode(text),
  setText: (node: Text, text) => {
    node.nodeValue = text;
  },
  querySelector: value => document.querySelector(value),
  nextSibling: (node: HTMLElement) => node.nextSibling
}