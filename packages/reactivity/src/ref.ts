import { hasChanged, isArray, isObject } from '@vue/shared/src';
import { track, trigger } from './effect';
import { TrackOptType, TriggerOpt } from './operator';
import { reactive } from './reactive';

// 传进来的是普通值
export function ref(value: string | number | boolean | object) {
  return createRef(value);
}

// 传进来的是普通值
export function shallowRef(value) {
  return createRef(value, true);
}

function createRef(value, isShallow = false) {
  return new RefImpl(value, isShallow);
}

const convert = val => isObject(val) ? reactive(val) : val;

class RefImpl {
  // 存放处理过的值
  public _value;
  // 存放原值
  public _rawValue;
  private isShallow;

  public _v_isRef = true;

  public constructor(value, isShallow) {
    // 如果是深度且是对象，只用reactive去处理响应式
    this._value = isShallow ? value : convert(value);
    // 保存原值
    this._rawValue = value;

    this.isShallow = isShallow;
  }

  get value() {
    track(this, 'value', TrackOptType.GET);
    return this._value;
  }

  set value(newValue) {
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue;
      this._value = this.isShallow ? newValue : convert(newValue);

      trigger(this, TriggerOpt.SET, 'value', newValue, this._value);
    }
  }
}

class ObjectRefImpl {
  public _v_isRef = true;
  public target;
  public key;
  constructor(target, key) {
    this.target = target;
    this.key = key;
  }

  get value() {
    return this.target[this.key];
  }

  set value(newValue) {
    this.target[this.key] = newValue;
  }
}

// 传进来的是响应式对象
// 将一个对象的属性变成ref
// 代理了对象的属性
export function toRef(target, key) {
  return new ObjectRefImpl(target, key);
}

// 传进来的是响应式对象
export function toRefs(target) {
  const ret = isArray(target) ? new Array(target.length) : {};
  for (const key in target) {
    ret[key] = toRef(target, key);
  }

  return ret;
}