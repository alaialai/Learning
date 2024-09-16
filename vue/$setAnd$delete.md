<!--
 * @Author: xiangly
 * @Date: 2020-07-27 16:40:47
 * @LastEditors: xiangly
 * @LastEditTime: 2020-07-27 20:15:51
 * @Description: file content
-->

# \$set 和\$delete

## \$set

在 object 上设置一个属性，如果 object 是响应式的，Vue.js 会保证属性被创建后也是响应式的，并且触发试图更新。用于 Vue.js 不能侦测属性被添加后的限制

## \$delete

删除数据中的某个属性。由于 Vue 的变化侦测是 Object.defineProperty 实现，使用 delete 关键字删除无法发现数据发生变化。所以提供 vm.\$delete 方法来删除数据中的某个属性，并且此时 Vue.js 可以侦测到数据发生变化
