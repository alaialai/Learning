<!--
 * @Author: xiangly
 * @Date: 2020-06-29 20:10:33
 * @LastEditors: xiangly
 * @LastEditTime: 2020-07-08 20:51:03
 * @Description: file content
-->

# Array

## Array 的变化侦测

因为 object 采用的是 getter/setter 的方式侦测变化，这种方式的缺点是只能侦测到属性的改变，新增和删除属性并不会被侦测到。但 Array 的改变比较多的是长度的改变，所以采用的侦测方式不同。Array 采用的是用一个拦截器覆盖 Array.prototype。使用 Array 原型上的方法操作数组时，执行的时拦截器中提供的方法，但是再拦截器中使用原生 Array 的原型方法去操作数组。

### 收集依赖

array 的依赖保存在 Observer 实例上，因为要在 getter 中可以访问到 observer 实例，同时在 Array 拦截器中也可以访问到 Observer 实例。

### 缺陷

1. this.list[0] =2
2. this.list.length = 0
   上面两种方法无法触发 re-render 或 watch
