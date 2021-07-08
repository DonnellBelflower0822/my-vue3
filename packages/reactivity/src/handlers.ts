import { hasChanged, hasOwn, isArray, isInteger, isObject } from '@vue/shared';
import { track, trigger } from './effect';
import { TrackOptType, TriggerOpt } from './operator';
import { reactive, readonly } from './reactive';

/**
 * createGet
 * @param isReadonly 是否只读
 * @param shallow 是否浅层
 * @returns function
 */
function createGet(isReadonly = false, shallow = false) {
  return function (target, key, receiver) {
    // 类比 target[key]
    const result = Reflect.get(target, key, receiver);

    if (!isReadonly) {
      // 非只读，需要收集依赖
      track(target, key, TrackOptType.GET);
    }

    if (shallow) {
      // 浅层的就结束
      return result;
    }

    // 如果是对象，且非浅层的，还是继续递归调用readonly和reactive
    if (isObject(result)) {
      return isReadonly ? readonly(result) : reactive(result);
    }

    // 非对象就直接返回
    return result;
  };
}

/**
 * 创建set
 * @param shallow 是否浅层
 * @returns 
 */
function createSet(shallow = false) {
  return function (target, key, value, receiver) {
    // 获取原来值
    const oldValue = Reflect.get(target, key);

    // 设置后会返回一个是否成功
    const result = Reflect.set(target, key, value, receiver);

    /**
     * 新增
     *    数组：并且设置索引，并且设置的索引比当前数组的长度还长
     *    对象：设置的key不是对象本身已有的属性
     * 修改
     *    新旧值不一样则是修改
     */
    const hasKey = isArray(target) && isInteger(key)
      ? Number(key) < target.length - 1
      : hasOwn(target, key);

    if (!hasKey) {
      // 通知：新增操作
      trigger(target, TriggerOpt.ADD, key, value);
    } else if (hasChanged(oldValue, value)) {
      // 通知：修改操作
      trigger(target, TriggerOpt.SET, key, value, oldValue);
    }

    // 返回修改结果
    return result;
  };
}

export const reactiveHandler = {
  get: createGet(),
  set: createSet(true)
};

export const shallowReactiveHandler = {
  get: createGet(false, true),
  set: createSet(false)
};

// readonly的设置都返回报错
export const readonlyHandler = {
  get: createGet(true),
  set: () => {
    console.log('error');
  }
};
export const shallowReadonlyHandler = {
  get: createGet(true, true),
  set: () => {
    console.log('error');
  }
};