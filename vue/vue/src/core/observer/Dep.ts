/*
 * @Author: xiangly
 * @Date: 2020-06-29 15:55:16
 * @LastEditors: xiangly
 * @LastEditTime: 2020-06-29 19:42:52
 * @Description: Dep类，用来管理依赖。
 * 通过这个类可以收集依赖、删除依赖或者向依赖发通知
 * vue/src/core/observer/dep.js
 */

export default class Dep {
  constructor() {
    this.subs = [];
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  removeSub(sub) {
    remove(this.subs, sub);
  }
  // 收集依赖
  depend() {
    if (window.target) {
      this.addSub(window.target);
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
