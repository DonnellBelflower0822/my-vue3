export const patchEvent = (el, key: string, fn) => {
  // 缓存
  const invokers = el._vei || (el._vei = {});
  const exists = invokers[key];

  if (fn && exists) {
    // 修改
    exists.value = fn;
  } else {
    const eventName = key.slice(2).toLowerCase();
    if (fn) {
      // 绑定
      const invoker = invokers[key] = createInvoker(fn);
      el.addEventListener(eventName, invoker);
    } else {
      // 删除
      el.removeEventListener(eventName, exists);
      invokers[key] = undefined;
    }
  }
};

function createInvoker(fn) {
  const invoker = (e) => {
    invoker.value(e);
  };
  // 随时改值
  invoker.value = fn;
  return invoker;
}