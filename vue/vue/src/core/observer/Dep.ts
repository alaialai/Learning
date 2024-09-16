/*
 * @Author: xiangly
 * @Date: 2020-06-29 15:55:16
 * @LastEditors: xiangly
 * @LastEditTime: 2020-07-11 15:08:47
 * @Description: Dep类，用来管理依赖。
 * 通过这个类可以收集依赖、删除依赖或者向依赖发通知
 * vue/src/core/observer/dep.js
 */

let uid = 0;
export default class Dep {
  constructor() {
    this.id == uid++;
    this.subs = [];
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  removeSub(sub) {
    // 从依赖列表中移除（也是unwatch的原理）
    const index = this.subs.indexOf(sub);
    if (index > -1) {
      return this.subs.splice(index, 1);
    }
  }
  // 收集依赖
  depend() {
    if (window.target) {
      // Dep记录数据发生变化时，需要通知哪些Watcher，Watcher中同样记录了自己会被哪些Dep通知。
      window.EventTarget.addDep(this);
    }
  }
  // 循环dep以触发收集到的依赖
  notify() {
    const subs = this.subs.slice();
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update(); //watcher中的update
    }
  }
}

function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}
