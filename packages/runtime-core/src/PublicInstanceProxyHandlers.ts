import { hasOwn } from '@vue/shared/src';

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    if (key[0] === '$') {
      return;
    }

    const { setupState, props, data } = instance;
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(data, key)) {
      return data[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    } else {
      return undefined;
    }
  },
  set({ _: instance }, key, value) {
    const { setupState, props, data } = instance;
    if (hasOwn(setupState, key)) {
      setupState[key] = value;
    } else if (hasOwn(data, key)) {
      data[key] = value;
    }    else if (hasOwn(props, key)) {
      props[key] = value;
    }
    return true;
  }
};