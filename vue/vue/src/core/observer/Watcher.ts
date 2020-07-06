/*
 * @Author: xiangly
 * @Date: 2020-06-29 16:26:18
 * @LastEditors: xiangly
 * @LastEditTime: 2020-06-29 19:48:25
 * @Description: file content
 */
export default class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm;
    this.getter = parsePath(expOrFn);
    this.cb = cb;
    this.value = this.get();
  }

  get() {
    window.target = this; //指向当前watcher实例
    let value = this.getter.call(this.vm, this.vm);
    window.target = undefined;
    return value;
  }

  update() {
    const oldValue = this.value;
    this.value = this.get();
    this.cb.call(this.vm, this.value, oldValue);
  }
}

/**
 * @description: 解析简单路径
 * 将keyPath用.分割成数组，然后循环数组一层一层去读数据，最后拿到的obj就是keypath中想要读的数据
 * @param {type}
 * @return:
 */
const bailRE = /[^\w.$]/;
export function parsePath(path) {
  if (bailRE.test(path)) {
    return;
  }

  const segments = path.split(".");
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return;
      obj = obj[segments[i]];
    }
    return obj;
  };
}
