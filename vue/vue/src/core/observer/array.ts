/*
 * @Author: xiangly
 * @Date: 2020-06-29 20:27:33
 * @LastEditors: xiangly
 * @LastEditTime: 2020-07-08 20:48:31
 * @Description: file content
 */
import { def } from "../util/index";

const arrayProto = Array.prototype;
export const arrayMethods = Object.create(arrayProto)[
  
const methodsToPatch =  ("push", "pop", "shift", "unshift", "splice", "sort", "reverse")
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // 缓存原始方法
  const original = arrayProto[method];
  def(arrayMethods, method, function mutator(...args) {
      const result = original.apply(this, args);
      // 获取Observer实例
      const ob = this._ob_;
      // 对数组新增的的元素，用Observe来侦测
      let inserted
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args
          break;
      case 'splice':
        inserted = args.slice(2)
        default:
          break;
      }
      if(inserted) ob.observeArray(inserted)
      // 向依赖发送消息(通知依赖数据发生了变化)
      ob.dep.notify();
      // 使用原生的方法
      return result;
    },
    enumerable: false,
    writable: true,
    configurable: true,
  );
});
