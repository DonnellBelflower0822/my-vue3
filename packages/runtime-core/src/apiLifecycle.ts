import { currentInstance, setCurrentInstance } from './component';

const enum LifeCycleHook {
  BEFORE_CREATE = 'bc',
  CREATED = 'c',

  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',

  BEFORE_UPDATE = 'bu',
  UPDATED = 'u',

  BEFORE_UNMOUNT = 'bum',
  UNMOUNTED = 'um'
}

// 往实例注入生命周期钩子数组
const injectHook = (type, hook, target) => {
  if (!target) {
    return console.warn('不存在instance');
  }

  const hooks = target[type] || (target[type] = []);
  const wrap = () => {
    // 确保钩子调用getCurrentInstance时都能获取当前的实例
    setCurrentInstance(target);
    hook();
    setCurrentInstance(null);
  };
  hooks.push(wrap);
};

// 创建钩子
const createHook = (lifeCycle: string) => {
  // 在调用onBeforeMount()是在setup里面调用, 先把当前的实例缓存起来
  return (hook, target = currentInstance) => {
    // 标记当前实例
    injectHook(lifeCycle, hook, target);
  };
};

export const onBeforeMount = createHook(LifeCycleHook.BEFORE_MOUNT);
export const onMounted = createHook(LifeCycleHook.MOUNTED);

export const onBeforeUpdate = createHook(LifeCycleHook.BEFORE_UPDATE);
export const onUpdated = createHook(LifeCycleHook.UPDATED);

export const invokerArrayFns = (fns) => {
  for (let i = 0; i < fns.length; i += 1) {
    fns[i]();
  }
};
