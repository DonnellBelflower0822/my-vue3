import { isArray, isObject } from '@vue/shared/src';
import { createVNode, isVNode } from './vnode';

export function h(type, propsOrChildren, children?) {
  // console.log(type, propsOrChildren, children);
  const { length } = arguments;
  if (length === 2) {
    // 类型 + props
    // 类型 + children
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        // h('div',h('span'))
        return createVNode(type, null, [propsOrChildren]);
      }

      // h('div',{hello:1})
      return createVNode(type, propsOrChildren);
    } else {
      // 不是对象，则是children
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (length > 3) {
      children = Array.prototype.slice.call(arguments, 2);
    } else if (length === 3 && isVNode(children)) {
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
  }
}