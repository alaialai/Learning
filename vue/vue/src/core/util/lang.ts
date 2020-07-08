/*
 * @Author: xiangly
 * @Date: 2020-06-30 10:20:18
 * @LastEditors: xiangly
 * @LastEditTime: 2020-06-30 10:56:45
 * @Description: file content
 */
/**
 * @description: Define a property.
 * @return:
 */
export function def(obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  });
}
