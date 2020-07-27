/*
 * @Author: xiangly
 * @Date: 2020-06-29 16:08:32
 * @LastEditors: xiangly
 * @LastEditTime: 2020-07-27 15:34:58
 * @Description: file content
 */
import Dep from "./Dep";
import { arrayMethods } from "./array";
import { def,hasOwn } from "../util/index";

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
    /**
     * 在value上新增一个不可枚举的_ob_属性，这个属性的值就是当前Observer的实例，
     * 同时还可以用于标记是否为响应式
     */
    def(value,'_ob_',this)

    if (Array.isArray(value)) {
      /**
       * 若有prop，将拦截器赋值给value._prop_,通过_prop_实现覆盖value原型的功能
       * 若没有，则直接将arrayMethods的方法设置到被侦测的数组
       */
      const augment = hasProto ? protoAugment : copyAugemnt;
      augment(value, arrayMethods, arrayKeys);
      this.observeArray(value)
    } else {
      this.walk(value);
    }
  }

  /**
   * @description:
   * walk会将每一个数据都转换成getter/setter的形式来侦测变化
   * 这个方法只有在数据类型为object时被调用
   * @param {type}
   * @return:
   */
  walk(obj:Object) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]]);
    }
  },

  /**
   * Observe a list of Array items.
   */
  observeArray(item:Array<any>){
    for (let i = 0,l=items.length; i < l; i++) {
      observe(items[i])
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
  let childOb = observe(val)
  let dep = new Dep();

  // dep用来存储被收集的依赖
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      dep.depend();
      // 收集Array的依赖
      if(childOb){
        childOb.dep.depend()
      }
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

/**
 * @description: Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 * @param {type}
 * @return:
 */
function protoAugment(target, src: Object) {
  target._prop_ = src;
}

/**
 * Augment a target Object or Array by defining
 * hidden properties.
 */
function copyAugment(target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
export function observe (val:any,asRootData:?boolean){
  if(!isObject(value)){
    return 
  }
  let ob
  if(hasOwn(value,'_ob_') && value._ob_ instanceof Observer){
    ob = value._ob_
  }else{
    ob = new Observer(value)
  }
  return ob
}

