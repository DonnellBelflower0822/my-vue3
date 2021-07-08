import { createRenderer } from '@vue/runtime-core';
import { nodeOps } from './nodeOps';
import { patchProp } from './patchProp';

// 渲染用到的方法：
// 跟平台相关的api
// 创建dom，修改dom属性等
const rendererOptions = { ...nodeOps, patchProp };

export function createApp(rootComponent, rootProps = null) {
  const app: any = createRenderer(rendererOptions)
    .createApp(rootComponent, rootProps);
  const { mount } = app;
  // 重写mount，执行一些跟平台相关的操作
  app.mount = function (container) {
    // 获取真实dom
    container = nodeOps.querySelector(container);
    // 清空
    container.innerHTML = '';
    // 才是真正的挂载
    mount(container);
  };
  return app;
}

export * from '@vue/runtime-core';