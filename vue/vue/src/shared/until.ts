/*
 * @Author: xiangly
 * @Date: 2020-07-07 19:51:39
 * @LastEditors: xiangly
 * @LastEditTime: 2020-07-27 16:55:47
 * @Description: file content
 */

/**
 * Check whether an object has the property.
 */
const hasOwnProperty = Object.prototype.hasOwnProperty;
export function hasOwn(obj: Object | Array<*>, key: string): boolean {
  return hasOwnProperty.call(obj, key);
}

export function isValidArrayIndex(val: any): boolean {
  const n = parseFloat(String(val));
  return n >= 0 && Math.floor(n) === n && isFinite(val);
}
