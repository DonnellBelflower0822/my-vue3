import { isArray, isInteger, isNumber } from '@vue/shared/src';
import { TriggerOpt } from './operator';

interface EffectOptions {
  lazy?: boolean;
  scheduler?: (effect?) => void;
}

export function effect(fn, options: EffectOptions = {}) {
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

// 存放当前的effect，方便track将target，key和对应的effect关联起来
let activeEffect;
// 存放一个栈形结构，保证activeEffect指向正确
const effectStack = [];

let uid = 0;
function createReactiveEffect(fn, options: EffectOptions) {
  const effect = function createEffect() {
    // 保证不再重复
    if (!effectStack.includes(effect)) {
      try {
        effectStack.push(effect);
        activeEffect = effect;

        // 其实还是调用传进来的函数
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
// @ts-ignore
const targetMap = window.a = new WeakMap();

/**
 * 收集依赖，将target,key关联起来
 * @param target 对象
 * @param key  属性
 * @param type 类型
 * @returns 
 */
export function track(target, key, type) {
  // 如果当前使用值不在effect里面使用是不需要收集
  if (!activeEffect) {
    return;
  }

  /***
  存储的数据结果
  Weakmap {
    [ target ]: Map {
      [ key ] : Set [ effect1, effect2 ]
    }
  }
  */
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

/**
 * 触发更新
 * @param target 对象
 * @param type 更新类型
 * @param key 属性
 * @param newValue 新值
 * @param oldValue 旧值
 * @returns 
 */
export function trigger(target, type, key: string, newValue?, oldValue?) {
  // 此对象没被依赖收集就不需要处理
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
      // 更改长度
      // length收集的effects要执行
      // 大于新设置长度的索引收集的effects也要执行
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
        // 数组：新增操作，length收集的effects要执行
        if (isArray(target) && isInteger(key)) {
          add(depsMap.get('length'));
        }
    }
  }

  // 要执行的effects依次执行
  effects.forEach((effect: any) => {
    // effect不一定都是立即执行的，可能做一下其他事情，比如computed
    if (effect.options?.scheduler) {
      effect.options.scheduler(effect);
    } else {
      effect();
    }
  });
}