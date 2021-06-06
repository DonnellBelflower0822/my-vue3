import { hasChanged, hasOwn, isArray, isInteger, isObject } from '@vue/shared';
import { track, trigger } from './effect';
import { TrackOptType, TriggerOpt } from './operator';
import { reactive, readonly } from './reactive';

function createGet(isReadonly = false, shallow = false) {
  return function (target, key, receiver) {
    const result = Reflect.get(target, key, receiver);

    if (!isReadonly) {
      // 需要收集依赖
      track(target, key, TrackOptType.GET);
    }

    if (shallow) {
      return result;
    }

    if (isObject(result)) {
      return isReadonly ? readonly(result) : reactive(result);
    }

    return result;
  };
}

const get = createGet();
const readonlyGet = createGet(true);
const shallowReactiveGet = createGet(false, true);
const shallowReadonlyGet = createGet(true, true);

function createSet(isReadonly = false) {
  return function (target, key, value, receiver) {
    const oldValue = Reflect.get(target, key);
    const result = Reflect.set(target, key, value, receiver);

    // 修改数组的索引
    const hasKey = isArray(target) && isInteger(key)
      ? Number(key) < target.length - 1
      : hasOwn(target, key);

    if (!hasKey) {
      // 新增
      trigger(target, TriggerOpt.ADD, key, value);
    } else if (hasChanged(oldValue, value)) {
      // 修改
      trigger(target, TriggerOpt.SET, key, value, oldValue);
    }

    return result;
  };
}

const set = createSet();
const shallowSet = createSet(true);

export const reactiveHandler = {
  get,
  set
};
export const shallowReactiveHandler = {
  get: shallowReactiveGet,
  set: shallowSet
};

export const readonlyHandler = {
  get: readonlyGet,
  set: () => {
    console.log('error');
  }
};
export const shallowReadonlyHandler = {
  get: shallowReadonlyGet,
  set: () => {
    console.log('error');
  }
};