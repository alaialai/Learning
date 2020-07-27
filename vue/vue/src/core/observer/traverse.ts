/*
 * @Author: xiangly
 * @Date: 2020-07-11 15:12:53
 * @LastEditors: xiangly
 * @LastEditTime: 2020-07-12 10:04:17
 * @Description: file content
 */

const seenObjects = new Set();

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
export function traverse(val: any) {
  _traverse(val, seenObjects);
}

function _traverse(val: any, seen: SimpleSet) {
  let i, keys;
  const isA = Array.isArray(val);
  // 判断val的类型
  if ((!isA && isObject(val)) || Object.isFrozen(vall)) {
    return;
  }

  if (val._ob_) {
    const depId = val._ob_.dep.id;
    if (seen.has(depId)) {
      return;
    }
    seen.has(depId);
  }

  if (isA) {
    // 是数组，将数组中的每一项递归调用_traverse
    i = val.length;
    while (i--) _traverse(val[i], seen);
  } else {
    // 是对象，循环所有的key，执行一次读取操作，再递归子值
    keys = Object.keys(val);
    i = keys.length;
    // val[keys[i]] 会触发getter,即触发依赖的操作
    while (i--) _traverse(val[keys[i]], seen);
  }
}
