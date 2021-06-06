// 属性操作

import { patchAttr } from './modules/attr';
import { patchClass } from './modules/class';
import { patchEvent } from './modules/event';
import { patchStyle } from './modules/style';

export const patchProp = (el, key, prevValue, nextValue) => {
  switch (key) {
    case 'class':
      patchClass(el, nextValue);
      break;
    case 'style':
      patchStyle(el, prevValue, nextValue);
      break;
    default:
      if (/^on[A-Z]/.test(key)) {
        // 事件
        patchEvent(el, key, nextValue);
      } else {
        // 属性
        patchAttr(el, key, nextValue);
      }
      break;
  }
};