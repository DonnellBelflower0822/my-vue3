import { currentInstance, setCurrentInstance } from './component';

const enum LifeCycleHook {
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
  BEFORE_UPDATE = 'bu',
  UPDATED = 'u',
}

const injectHook = (type, hook, target) => {
  if (!target) {
    return console.warn('不存在instance');
  }

  const hooks = target[type] || (target[type] = []);
  const wrap = () => {
    setCurrentInstance(target);
    hook();
    setCurrentInstance(null);
  };
  hooks.push(wrap);
};

const createHook = (lifeCycle) => {
  return (hook, target = currentInstance) => {
    injectHook(lifeCycle, hook, target);
  };
};

export const invokerArrayFns = (fns) => {
  for (let i = 0; i < fns.length; i += 1) {
    fns[i]();
  }
};

export const onBeforeMount = createHook(LifeCycleHook.BEFORE_MOUNT);
export const onMounted = createHook(LifeCycleHook.MOUNTED);
export const onBeforeUpdate = createHook(LifeCycleHook.BEFORE_UPDATE);
export const onUpdated = createHook(LifeCycleHook.UPDATED);