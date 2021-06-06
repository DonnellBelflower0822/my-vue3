import { isFunction, isObject, ShapeFlags } from '@vue/shared/src';
import { PublicInstanceProxyHandlers } from './PublicInstanceProxyHandlers';

export function createComponentInstance(vnode) {
  // 组件实例
  const instance: any = {
    vnode,
    type: vnode.type,
    props: {},
    attrs: {},
    slots: {},
    // setup返回一个对象
    setupState: {},
    render: null,
    // 这个组件是否挂载
    isMounted: false
  };

  instance.ctx = { _: instance };
  return instance;
}

export function setupComponent(instance) {
  const { props, children } = instance.vnode;
  instance.props = props;
  // todo 插槽
  instance.children = children;

  const flag = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT;
  if (flag) {
    // 带状态的组件
    // instance.setupState;
    setupStatefulComponent(instance);
  }
}
export let currentInstance = null;

export const setCurrentInstance = (instance) => {
  currentInstance = instance;
};

export const getCurrentInstance = () => {
  return currentInstance;
};

function setupStatefulComponent(instance) {
  // 代理
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);

  // 组件类型
  const Component = instance.type;
  const { setup } = Component;

  // instance.setupState =
  // 有无setup
  if (setup) {
    const setupContext = createContext(instance);
    currentInstance = instance;
    const setupResult = setup(instance.props, setupContext);
    handleSetupResult(instance, setupResult);
  }
  else {
    finishComponentSetup(instance);
  }
}

function handleSetupResult(instance, setupResult) {
  if (isFunction(setupResult)) {
    instance.render = setupResult;
  } else if (isObject(setupResult)) {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
  const { type: Component } = instance;
  if (!instance.render) {
    if (!Component.render && Component.template) {
      // 对template进行模板编译成render
    }

    instance.render = Component.render;
  }

  // 兼容vue2

  // render
  // console.log(instance)
}

function createContext(instance) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: () => { },
    expose: () => { }
  };
}