export const patchStyle = (el: HTMLElement, prev, next) => {
  const { style } = el;
  if (next === null) {
    el.removeAttribute('style');
  } else {
    // 老的有，新的没有
    if (prev) {
      for (const key in prev) {
        if (next[key] === null) {
          // 删除
          style[key] = '';
        }
      }
    }

    // 新的都加上
    for (const key in next) {
      style[key] = next[key];
    }
  }
}