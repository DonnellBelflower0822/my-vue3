import { isArray, isObject, isString, ShapeFlags } from '@vue/shared/src';

export function isVNode(vnode) {
  return vnode._v_isVnode;
}

// 目前只考虑元素和组件
export function createVNode(type, props, children = null) {
  // 标识：为后期patch比较提供便利
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : (isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0);

  const vnode = {
    // 是否是vnode
    _v_isVnode: true,

    type,
    props,
    children,

    key: props && props.key,

    // 真实的节点
    el: null,
    // 实例
    component: null,

    shapeFlag
  };

  // 根据children标识
  normalizeChildren(vnode, children);

  return vnode;
}

// 设置children的类型
function normalizeChildren(vnode, children) {
  let type = 0;
  if (children === null) { }
  else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN;
  } else {
    type = ShapeFlags.TEXT_CHILDREN;
  }

  vnode.shapeFlag |= type;
}

export const TEXT = Symbol();
export function normalizeVNode(child) {
  if (isObject(child)) {
    return child;
  }

  return createVNode(TEXT, null, String(child));
}