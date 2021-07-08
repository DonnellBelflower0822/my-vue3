import { effect } from '@vue/reactivity/src';
import { ShapeFlags } from '@vue/shared/src';
import { createAppApi } from './apiCreateApp';
import { invokerArrayFns } from './apiLifecycle';
import { createComponentInstance, setupComponent } from './component';
import { queueJob, invalidateJob } from './scheduler';
import { normalizeVNode, TEXT } from './vnode';

// 创建一个渲染器
export function createRenderer(rendererOptions) {
  // 获取runtime-dom传过来的dom操作方法
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    forcePatchProp: hostForcePatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    nextSibling: hostNextSibling
  } = rendererOptions;

  const updateComponentPreRender = (instance, nextVNode) => {
    nextVNode.component = instance;
  };

  const setupRenderEffect = (instance, vnode, container) => {
    // 组件级更新
    instance.update = effect(
      function componentEffect() {
        if (!instance.isMounted) {
          const { bm, m } = instance;

          // beforeMount
          if (bm) {
            invokerArrayFns(bm);
          }

          const { proxy } = instance;
          // 类比react的classComponent，调用render才是要渲染
          const subTree = instance.subTree = instance.render.call(proxy, proxy);
          // console.log(subTree);

          patch(null, subTree, container);

          // 初始化
          instance.isMounted = true;

          vnode.el = subTree.el;

          // 执行mounted
          if (m) {
            // 在微任务去调用mounted
            Promise.resolve().then(() => {
              invokerArrayFns(m);
            });
          }
        } else {
          const { bu, u } = instance;
          let { next } = instance;

          // 用next赋值给
          if (next) {
            next.el = vnode.el;
            updateComponentPreRender(instance, next);
          } else {
            next = vnode;
          }

          // beforeUpdate
          if (bu) {
            invokerArrayFns(bu);
          }

          // 更新
          const prevTree = instance.subTree;
          const { proxy } = instance;
          const nextTree = instance.render.call(proxy, proxy);
          patch(prevTree, nextTree, container);

          // updated
          if (u) {
            invokerArrayFns(u);
          }
        }
      },
      {
        // 调度
        // 处理多次调用，只执行一次
        scheduler: queueJob
      }
    );
  };

  // 挂载子节点
  const mountChildren = (children, el) => {
    for (let i = 0; i < children.length; i++) {
      // 标准化子VNode
      // 如果是字符串：则生成文本节点
      const child = normalizeVNode(children[i]);
      // 调用patch进行分别挂载
      patch(null, child, el);
    }
  };

  // 挂载Element元素
  const mountElement = (vnode, container, anchor = null) => {
    const { props, shapeFlag, type, children } = vnode;

    // 创建元素
    const el = (vnode.el = hostCreateElement(type));

    // 处理属性
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }

    // 处理元素children
    // 1. children为文本节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本内容
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 2. 元素数组
      mountChildren(children, el);
    }

    // 挂载到容器上
    hostInsert(el, container, anchor);
  };

  const patchProps = (oldProps, newProps, el) => {
    if (oldProps !== newProps) {
      for (const key in oldProps) {
        const oldValue = oldProps[key];
        const nextValue = newProps[key];
        // key的值改了
        if (oldValue !== nextValue) {
          hostPatchProp(el, key, oldValue, nextValue);
        }
      }

      // 老值有，新值没有
      for (const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null);
        }
      }
    }
  };

  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i]);
    }
  };

  const patchKeyedChildren = (c1, c2, el) => {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;

    // 从左往右
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      i++;
    }

    // 从右往左
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    // console.log(i, e1, e2);
    // 比较有一方已经比完了
    if (i > e1) {
      console.log(i, e1, e2);
      // 老的少，新的多
      /**
       新增: 后增
      c1: [a,b]
      c2: [a,b,c,d]
      i: 2, e1: 1, e2: 3  -> 新增 [i,e2]  = [2,3]

      新增：前增
      c1: [c,d]
      c2: [a,b,c,d]
      i: 0, e1: -1, e2: 1 -> 新增 [i,e2]  = [0,1]
       */
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < c2.length ? c2[nextPos].el : null;
        // 有新增
        while (i <= e2) {
          patch(null, c2[i], el, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      console.log(
        `
        删除
        i: ${i},
        e1: ${e1},
        e2: ${e2}
        `
      );
      /**
      删除：后删
      c1: [a,b,c,d]
      c2: [a,b]
      i: 2, e1: 3, e2: 1  -> 删除 [i,e1]  = [2,3]

      删除：前删
      c1: [c,d,a,b]
      c2: [a,b]
      i: 0, e1: 1, e2: -1  -> 删除 [i,e1]  = [0,1]
     */
      // 删除
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    } else {
      // 乱序

      /**
       c1: [a,b,c,d,e,f,g]
       c2: [a,b,e,c,d,h,f,g]
       c1还没比对的 [i,e1] : [c,d,e]
       c2还没比对的 [i,e2] : [e,c,d,h]
       */
      let s1 = i;
      let s2 = i;

      // 拿到新的 {key: index}
      const keyToNewIndexMap = new Map();
      for (let i = s2; i <= e2; i++) {
        const childVNode = c2[i];
        keyToNewIndexMap.set(childVNode.key, i);
      }

      const toBePatched = e2 - s2 + 1;
      // 数组的索引代表新节点在数组的索引
      // 数组的索引对应的值代表旧节点在数组的索引
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0);

      // 去老的找有没有可以复用的
      for (let i = s1; i <= e1; i++) {
        const oldVNode = c1[i];
        const newIndex = keyToNewIndexMap.get(oldVNode.key);

        if (newIndex === undefined) {
          // 老的里的不再新的
          unmount(oldVNode);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;

          // 对比oldVNode和新的vnode， 复用
          // todo 比较好了，位置不对
          patch(oldVNode, c2[newIndex], el);
        }
      }

      console.log(newIndexToOldIndexMap);

      for (let i = toBePatched - 1; i >= 0; i--) {
        // 找到h的索引
        const currentIndex = i + s2;
        // 当前节点
        const child = c2[i + s2];

        // 根据参照物插入
        const anchor = currentIndex + 1 < c2.length ? c2[currentIndex + 1].el : null;

        if (newIndexToOldIndexMap[i] === 0) {
          // 没有patched，属于新增
          patch(null, child, el, anchor);
        } else {
          // notify: 剩余节点都得操作一次，性能问题
          hostInsert(child.el, el, anchor);

          // [1,2,3,4,5,6]
          // [1,6,2,3,4,5]
          // 最长递增序列
        }
        // console.log(child);
      }

      // console.log(newIndexToOldIndexMap);

      // 最后移动节点，并且新增节点插入
      // console.log(keyToNewIndexMap);

      // console.log(i, e1, e2);
    }
  };

  const patchChildren = (n1, n2, container) => {
    const c1 = n1.children;
    const c2 = n2.children;
    // 类型
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;

    // 新的是文本
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 卸载
        unmountChildren(c1);
      }

      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
      return;
    }

    if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 两次都是数组
        patchKeyedChildren(c1, c2, container);
      } else {
        // 老的没有孩子, null
        unmountChildren(c1);
      }
      return;
    }
    
    // 上一次是文本
    if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(container, '');
    }
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(c2, container);
    }
  };

  const patchElement = (n1, n2, container, anchor = null) => {
    // 复用dom节点
    const el = (n2.el = n1.el);

    // 更新属性
    patchProps(n1.props, n2.props, el);

    // 更新子节点
    patchChildren(n1, n2, el);
  };

  const processElement = (n1, n2, container, anchor = null) => {
    if (n1 === null) {
      mountElement(n2, container, anchor);
    } else {
      // 元素更新
      patchElement(n1, n2, container, anchor);
    }
  };

  function hasPropsChanged(prevProps, nextProps) {
    // 长度不一致，变了
    if (Object.keys(prevProps).length !== Object.keys(nextProps).length) {
      return true;
    }

    for (const key in nextProps) {
      if (prevProps[key] !== nextProps[key]) {
        return true;
      }
    }

    return false;
  }

  function shouldUpdateComponent(n1, n2) {
    const { props: prevProps } = n1;
    const { props: nextProps } = n2;

    if (prevProps === nextProps) {
      return false;
    }

    if (!prevProps) {
      return !!nextProps;
    }

    return hasPropsChanged(prevProps, nextProps);
  }

  const mountComponent = (vnode, container) => {
    // 组件渲染
    // 核心流程：setup返回值  -> render

    // 1.实例,同时挂载到虚拟节点上
    const instance = vnode.component = createComponentInstance(vnode);
    // 2. 需要的数据解析到实例上
    setupComponent(instance);
    // 3. 创建effect让render执行
    setupRenderEffect(instance, vnode, container);
  };

  // 更新组件
  const updateComponent = (n1, n2) => {
    // 复用component
    const instance = n2.component = n1.component;

    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;

      // 去掉子组件的update
      invalidateJob(instance.update);

      // 最后执行一次更新
      instance.update();
    }
  };

  // 处理组件
  const processComponent = (n1, n2, container) => {
    if (n1 === null) {
      // 挂载
      mountComponent(n2, container);
    } else {
      // 组件更新
      updateComponent(n1, n2);
    }
  };

  const processText = (n1, n2, container) => {
    if (n1 === null) {
      // 挂载
      // 新建文本节点
      n2.el = hostCreateText(n2.children);
      // 插入父容器
      hostInsert(n2.el, container);
    } else {
      // 更新：复用旧节点的元素
      const el = n2.el = n1.el;
      // 比较新旧文本节点的children是否一致
      if (n2.children !== n1.children) {
        // 如果不同只重新设置文本内容
        hostSetText(el, n2.children);
      }
    }
  };

  const isSameVNodeType = (n1, n2) => {
    return n1.type === n2.type && n1.key === n2.key;
  };

  const unmount = (vnode) => {
    hostRemove(vnode.el);
  };

  /**
   * 打补丁：挂载和更新的功能
   * @param n1 旧节点
   * @param n2 新节点
   * @param container 挂载容器
   * @param anchor 当前元素的参照物
   */
  const patch = (n1, n2, container, anchor = null) => {
    const { shapeFlag, type } = n2;

    // 如果有旧vnode，且不是相同类型：直接把旧节点干掉，走挂载的流程
    if (n1 && !isSameVNodeType(n1, n2)) {
      //  删除以前，换成新的
      anchor = hostNextSibling(n1);
      unmount(n1);
      n1 = null;
    }

    // 根据不同类型，做不同操作
    switch (type) {
      case TEXT:
        // 文本节点，特殊处理
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 元素
          processElement(n1, n2, container, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 组件
          processComponent(n1, n2, container);
        }
    }
  };

  const render = (vnode, container) => {
    patch(null, vnode, container);
  };

  return {
    createApp: createAppApi(render)
  };
}