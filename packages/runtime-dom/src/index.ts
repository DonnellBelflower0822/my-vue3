import { createRenderer } from '@vue/runtime-core';
import { nodeOps } from './nodeOps';
import { patchProp } from './patchProp';

// 渲染用到的方
const rendererOptions = { ...nodeOps, patchProp };

export function createApp(rootComponent, rootProps = null) {
  const app: any = createRenderer(rendererOptions).createApp(rootComponent, rootProps);
  const { mount } = app;
  // 重写mount，执行一些额外操作
  app.mount = function (container) {
    container = nodeOps.querySelector(container);
    container.innerHTML = '';
    mount(container);
  };
  return app;
}

export * from '@vue/runtime-core';