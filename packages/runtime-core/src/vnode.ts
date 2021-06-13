import { isArray, isObject, isString, ShapeFlags } from '@vue/shared/src';

export function isVNode(vnode) {
  return vnode._v_isVnode;
}

export function createVNode(type, props, children = null) {
  // 根据type区分元素和组件
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