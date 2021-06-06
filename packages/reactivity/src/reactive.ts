import { isObject } from '@vue/shared';
import {
  reactiveHandler,
  readonlyHandler,
  shallowReactiveHandler,
  shallowReadonlyHandler
} from './handlers';

// 对象的任何层响应式
export function reactive<T = object>(obj: T) {
  return createReactiveObject(obj, false, reactiveHandler);
}

// 对象的任何层都只读
export function readonly<T = object>(obj: T) {
  return createReactiveObject(obj, true, readonlyHandler);
}

// 对象的浅层响应式，深层不响应
export function shallowReactive(obj) {
  return createReactiveObject(obj, false, shallowReactiveHandler);
}

// 对象的浅层只读，深度只读
export function shallowReadonly(obj) {
  return createReactiveObject(obj, true, shallowReadonlyHandler);
}

// 缓存已经处理过的对象
const reactiveMap = new WeakMap();
const readonlyMap = new WeakMap();

function createReactiveObject(target, isReadonly, baseHandlers) {
  // 只能处理是对象类型
  if (!isObject(target)) {
    return target;
  }

  const map = isReadonly ? readonlyMap : reactiveMap;

  if (map.has(target)) {
    // 返回已经缓存
    return map.get(target);
  }

  const proxy = new Proxy(target, baseHandlers);
  map.set(target, proxy);

  return proxy;
}