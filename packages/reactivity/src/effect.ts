import { isArray, isInteger, isNumber } from '@vue/shared/src';
import { TriggerOpt } from './operator';

export function effect(fn, options: any = {}) {
  const effect = createReactiveEffect(fn, options);

  if (!options.lazy) {
    effect();
  }

  return effect;
}

/**
  effect(()=>{
    state.name =1
    effect(()=>{
      state.age=2
    })
    state.address=3   // effect有问题
  })


  effect(()=>{
    state.age++
  })
 */

let activeEffect;
const effectStack = [];

let uid = 0;
function createReactiveEffect(fn, options) {
  const effect = function createEffect() {
    // 保证不再重复
    if (!effectStack.includes(effect)) {
      try {
        effectStack.push(effect);
        activeEffect = effect;
        return fn();
      } finally {
        // 保证effect永远正确
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  };

  effect.id = uid++;
  effect.__isEffect = true;
  effect.raw = fn;
  effect.options = options;

  return effect;
}

/**
 数据结构
 {
    {hello:'world'}: {
      hello: [effect,effect]
    }
 }
 */
const targetMap = new WeakMap();

export function track(target, key, type) {
  if (!activeEffect) {
    return;
  }

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let depMap = depsMap.get(key);
  if (!depMap) {
    depMap = new Set();
    depsMap.set(key, depMap);
  }

  const dep = depMap.has(activeEffect);
  if (!dep) {
    depMap.add(activeEffect);
  }
}

export function trigger(target, type, key, newValue?, oldValue?) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }

  // 要执行的effect存到新的集合
  const effects = new Set();
  const add = (effectToAdd) => {
    if (effectToAdd) {
      effectToAdd.forEach(effect => {
        effects.add(effect);
      });
    }
  };

  // 修改数组的长度
  if (isArray(target) && key === 'length') {
    depsMap.forEach((dep, key) => {
      // 更改长度，小于收集索引，那这个effect需要重新执行
      if (key === 'length' || (isNumber(key) && Number(key) > newValue)) {
        add(dep);
      }
    });
  } else {
    if (key !== undefined) {
      // 修改
      add(depsMap.get(key));
    }

    switch (type) {
      case TriggerOpt.ADD:
        // 添加索引，触发长度更新
        if (isArray(target) && isInteger(key)) {
          add(depsMap.get('length'));
        }
    }
  }

  effects.forEach((effect: any) => {
    // effect不一定都是立即执行的，可能做一下其他事情，比如computed
    if (effect.options?.scheduler) {
      effect.options.scheduler(effect);
    } else {
      effect();
    }
  });

}