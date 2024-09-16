<!--
 * @Author: xiangly
 * @Date: 2020-07-12 10:08:22
 * @LastEditors: xiangly
 * @LastEditTime: 2020-07-27 16:37:28
 * @Description: file content
-->

## vm.\$watch

### 用法

补充：
vm.\$watch 返回一个取消观察函数，用于停止触发回调

```js
var unwatch = vw.$watch("a", (newVal, oldVal) => {});
// 取消观察
unwatch();
```

### watch 的内部原理

vm.\$watch 是对 Watcher 的一种封装

### watch 的一些用法

```js
let unwatch = this.$watch(
  function () {
    return this.A + this.B;
  },
  function (newVal, oldVal) {
    console.log("newVal", newVal);
    console.log("oldVal", oldVal);
    if (newVal == 5) {
      unwatch();
    }
  }
);
```

### 和 Watcher 新增

1. 监听的多了函数，并且函数中读取的所有数据都可以被 Watcher 监听。

2. immediate 参数
   判断是否有这个参数，如果有立刻执行 cb

3. 获取返回的一个函数 unwatch
   执行了 Watcher.teardown()——将 watcher 实例从正在观察的列表中移除
   ==> 新增 addDep() 记录 Watcher 中订阅过的 Dep
   ==》新增 teardown() 通知订阅的 Dep，把他们自己从列表中删除

4. deep，如果 val 既不是 Array 也不是 Object，或者被冻结，直接返回，
   如果是 Array，循环数组每一项使用 traverse,
   如果是 Object，循环 keys，再进行一次读取操作使用 traverse
