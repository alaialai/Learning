/*
 * @Author: xiangly
 * @Date: 2020-06-29 16:26:18
 * @LastEditors: xiangly
 * @LastEditTime: 2020-07-13 20:42:27
 * @Description: file content
 */
export default class Watcher {
  vm: Component;
  cb: Function;
  deep: Boolean;

  constructor(vm: Component, expOrFn: string | Function, cb: Function) {
    this.vm = vm;
    if (options) {
      this.deep = !!options.deep;
    } else {
      this.deep = false;
    }
    this.deps = [];
    this.depIds = new Set();
    // expOrFn参数支持函数
    if (typeof expOrFn === "function") {
      // 直接将值赋值给getter，并且watcher会同时观察exOrFn函数中读取的所有Vue.js实例上的响应式数据
      this.getter = expOrFn;
    } else {
      // 用parsePath函数读取keypath中的数据（keypath是指属性路径）
      this.getter = parsePath(expOrFn);
    }
    this.cb = cb;
    this.value = this.get();
  }

  get() {
    window.target = this; //指向当前watcher实例
    let value = this.getter.call(this.vm, this.vm); //读取值，触发了getter，将this主动添加到Dep中
    if (this.deep) {
      traverse(value);
    }
    window.target = undefined;
    return value;
  }

  addDep(dep) {
    const id = dep.id;
    // 使用depIds来判断当前的Watcher是否已经订阅了该dep
    // 防止Dep中有重复的依赖
    if (!this.depIds.has(id)) {
      // 进行订阅

      // 记录已经订阅了这个Dep
      this.depIds.add(id);
      // 记录订阅的Dep;
      this.deps.push(dep);
      // 将自己订阅到Dep
      dep.addSub(this);
    }
  }

  update() {
    const oldValue = this.value;
    this.value = this.get();
    this.cb.call(this.vm, this.value, oldValue);
  }

  /**
   * Remove self from all dependencies' subscriber list.
   */
  teardown() {
    {
      let i = this.deps.length;
      while (i--) {
        this.deps[i].removeSub(this);
      }
    }
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
