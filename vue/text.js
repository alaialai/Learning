/*
 * @Author: xiangly
 * @Date: 2020-06-29 14:51:06
 * @LastEditors: xiangly
 * @LastEditTime: 2020-06-29 15:50:35
 * @Description: file content
 */

/**
 * @description:
 * @param {type}
 * @return:
 *
 * 假设依赖是一个函数，保存在window.target中
 *
 */
let window = {};
window.target = "o";
function defineReative(data, key, val) {
  // dep用来存储被收集的依赖
  let dep = [];
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      dep.push(window.target);
      return val;
    },
    set: function (newVal) {
      if (val === newVal) {
        return;
      }
      console.log(dep);
      for (let i = 0; i < dep.length; i++) {
        dep[i](newVal, val);
        console.log(dep);
      }
      val = newVal;
    },
  });
}

let a = new defineReative();
a.b = "g";
