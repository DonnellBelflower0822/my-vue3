import { isFunction, isObject } from '@vue/shared/src';
import { effect, track, trigger } from './effect';
import { TrackOptType, TriggerOpt } from './operator';

type Getter<T = unknown> = () => T;
type GetterOption<T = unknown> = {
  get: Getter<T>;
  set: () => void;
};
type GetterOrOptions<T> = Getter<T> | GetterOption<T>;

export function computed<T = unknown>(getterOrOptions: GetterOrOptions<T>) {
  let getter;
  let setter;

  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
    setter = () => {
      console.log('no change');
    };
  } else if (isObject(getterOrOptions)) {
    getter = (getterOrOptions as GetterOption).get;
    setter = (getterOrOptions as GetterOption).set;
  }

  return new ComputedRefImpl(getter, setter);
}

// effect的执行由自己控制什么时候执行
class ComputedRefImpl {
  public _dirty = true;
  public _value;
  public setter: any;
  public effect;

  constructor(getter, setter) {
    this.setter = setter;
    this.effect = effect(getter, {
      // 不是立即执行
      lazy: true,
      // 调度
      scheduler: () => {
        if (!this._dirty) {
          // 设置下次get的时候执行重新获取最新的值
          // 修改this._dirty,在下次获取时就可以去获取新值
          this._dirty = true;
          // 触发收集这个依赖的effect
          trigger(this, TriggerOpt.SET, 'value');
        }
      }
    });
  }

  get value() {
    if (this._dirty) {
      // 缓存起来，不是每个获取都是去走effect的
      this._value = this.effect();
      this._dirty = false;
    }
    // 收集依赖
    track(this, 'value', TrackOptType.GET);
    return this._value;
  }

  set value(newValue) {
    this.setter(newValue);
  }
}