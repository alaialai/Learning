/*
 * @Author: xiangly
 * @Date: 2020-06-29 16:08:32
 * @LastEditors: xiangly
 * @LastEditTime: 2020-07-27 20:32:01
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

export function set(target:Arrsy<any> | Object,key:any,val:any):any {
  if(Array.isArray(target) && isValidArrayIndex(key)){
    target.length = Math.max(target.length,key)
    // 数组拦截器会侦测到target发生了变化，并且会自动榜之新增的val转换成响应式
    target.splice(key,1,val)
    return val
  }

  // key已经存在于target中——key已经被侦测了变化
  if(key in target && !(key in Object.prototype)){
    // 修改数据，且发生变化后会自动向依赖发送消息
    target[key] = val
    return val
  }

  const ob = target._ob_
  if(target.isVue || (ob && ob.vmCount)){
    // target不能式vuejs实例（isVue）或vuejs实例的根数据对象（ob.vmCount）this.$data式根数据。
    pocess.env.NODE_ENV !== 'production' && warn (
      'Avoid adding reactive properties to a Vue instance or its root $data' + 'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  
  // 不是响应式
  if(!ob){
    target[key] = val
    return val
  }

  // 在响应式数据上新增了一个属性，需要跟踪新增数据的变化
  defineReactive(ob.value,key,val)
  ob.dep.notify()
  return val
}


/**
 * Delete a property and trigger change if necessary.
 */
export function del (target: Array<any> | Object,key:any){
  if(Array.isArray(target) && isValidArrayIndex(key)){
    target.splice(key,1)
    return
  }
  const ob = target._ob_
  if(target.isVue || (ob && ob.vmCount)){
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data' + '- just set it to null.'
    )
    return
  }

  // 如果key不是target自身的属性，则终止程序继续执行
  if(!hasOwn(target,key)){
    return
  }

  delete target[key]
  
  // 不是响应式数据
  if(!ob){
    return
  }
  
  ob.dep.notify()
}