import { createVNode } from './vnode';

export function createAppApi(render) {
  return function createApp(rootComponent, rootProps) {
    const app = {
      _props: rootProps,
      _component: rootComponent,
      _container: null,
      mount(container) {
        // 创建虚拟节点
        const vnode = createVNode(rootComponent, rootProps);

        // 调用render
        render(vnode, container);

        app._container = container;
      }
    };
    return app;
  };
}