export const isObject = obj => typeof obj === 'object' && obj !== null;

export const isArray = arr => Array.isArray(arr);
export const isNumber = a => typeof a === 'number';
export const isFunction = a => typeof a === 'function';
export const isString = a => typeof a === 'string';
export const isInteger = a => parseInt(a) + '' === a;

export const hasOwn = (target, key) => {
  return Object.prototype.hasOwnProperty.call(target, key);
};

export const hasChanged = (a, b) => {
  return a !== b;
};

export { ShapeFlags } from './shapeFlags';