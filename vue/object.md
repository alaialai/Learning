<!--
 * @Author: xiangly
 * @Date: 2020-06-29 14:32:47
 * @LastEditors: xiangly
 * @LastEditTime: 2020-06-29 20:04:22
 * @Description: file content
-->

# Object

## 变化侦测

侦测变化的两种方式：

1. Object.defineProperty
2. Proxy

Vue.js 2.0 使用 Object.defineProperty 实现。

### Object.defineProperty()

这个方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回该对象

当一个对象的状态发生改变，vue 通知该对象绑定的依赖（2.0 不是具体的 Dom 节点，是组件）进行 dom 更新操作（组件内部使用虚拟 DOM 进行对比）。vue 使用 Object.defineProperty()来监听对象。

#### Object 改变

读取对象时会触发对象的 get 函数，设置数据会触发对象的 set 函数

#### 对象绑定的依赖

在 getter 中收集依赖，在 setter 中触发依赖

1. 收集依赖
   在 getter 中收集依赖，
   在 set 被触发的时候，循环以触发收集到的依赖
   依赖收集到 Dep 中
2. 依赖（当属性发生变化后，通知对象）
   watcher:依赖收集好后通知的对象，由它再通知其他地方。
   在 watcher 的中的 get()函数把 window.target 指向 this，即 watcher 这个实例，再读取对象，就会激发对象的 getter 就会触发收集依赖。就会将 watcher 中的内容添加到 keyPath 的 Dep 中。Observer 类会把 object 类型的数据调用 walk 将每个属性转换成 getter/setter 的形式来侦测变化。

getter/setter 只能追踪一个数据是否被修改，无法追踪新增属性和删除属性
