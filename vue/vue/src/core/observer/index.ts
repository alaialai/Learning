/*
 * @Author: xiangly
 * @Date: 2020-06-29 16:08:32
 * @LastEditors: xiangly
 * @LastEditTime: 2020-07-06 21:19:38
 * @Description: file content
 */
import Dep from "./Dep";
import { arrayMethods } from "./array";

// 处理不能使用_prop_的情况

const hasProto = "_prop_" in {};
const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * @description:
 * Observer类会附加到每一个被侦测的object上
 * 一旦被附加上，Observe会将object的所有属性转换成getter/setter的形式来收集属性的依赖，并且当属性发生变化时会通知这些依赖
 * @param {type}
 * @return:
 */
export class Observer {
  constructor(value) {
    this.value = value;
    this.dep = new Dep();

    if (!Array.isArray(value)) {
      this.walk(value);
    }
  }

  /**
   * @description:
   * walk会将每一个睡醒都转换成getter/setter的形式来侦测变化
   * 这个方法只有在数据类型为object时被调用
   * @param {type}
   * @return:
   */
  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReative(obj, keys[i], obj[keys[i]]);
    }
  }
}

/**
 * Define a reactive property on an Object.
 */
export function defineReactive(data: object, key: string, val: any) {
  if (typeof val == "object") {
    new Observer(val);
  }

  let dep = new Dep();

  // dep用来存储被收集的依赖
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      dep.depend();
      return val;
    },
    set: function (newVal) {
      if (val === newVal) {
        return;
      }
      val = newVal;
      dep.notify();
    },
  });
}
