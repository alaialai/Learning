/*
 * @Author: xiangly
 * @Date: 2020-07-11 15:49:10
 * @LastEditors: xiangly
 * @LastEditTime: 2020-07-27 16:38:34
 * @Description: file content
 */

export function isNative(Ctor: any): boolean {
  return typeof Ctor === "function" && /native code/.test(Ctor.toString());
}

let _Set;

if (typeof Set !== "undefined" && isNative(Set)) {
  _Set = Set;
} else {
  _Set = class Set implements SimpleSet {
    set: Object;
    constructor(parameters) {
      this.set = Object.create(null);
    }
    has(key: string | number) {
      return this.set[key] === true;
    }
    add(key: string | number) {
      this.set[key] = true;
    }

    clear() {
      this.set = Object.create(null);
    }
  };
}

//  ?????
export interface SimpleSet {
  has(key: string | number): boolean;
  add(key: string | number): mixed;
  clear(): void;
}
