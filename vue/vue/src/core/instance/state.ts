/*
 * @Author: xiangly
 * @Date: 2020-07-08 21:28:13
 * @LastEditors: xiangly
 * @LastEditTime: 2020-07-11 11:33:12
 * @Description: file content
 */

import Watcher from "../observer/Watcher";

Vue.prototype.$watch = function (
  expOrFn: string | Function,
  cb: any,
  options?: Object
) {
  const vm = this;
  options = options || {};
  const watcher = new Watcher(vm, expOrFn, cb, options);
  // 判断是否使用了immediate参数，如果使用，立即执行一次cb
  if ((options, immediate)) {
    cb.call(vm, watcher.value);
  }
  // 在Watcher实例从当前正在观察的状态的依赖列表中移除
  return function unwatchFn() {
    watcher.teardown();
  };
};
