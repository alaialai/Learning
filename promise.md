<!--
 * @Author: xiangly
 * @Date: 2020-04-22 19:39:54
 * @LastEditTime: 2020-04-27 21:08:11
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \notes\javasript\promise.md
 -->

# promise

## Promise.resolve()

1. 传递一个真正的 promise，会返回同一个 promise
2. 传递一个非 promise 的 thenable 值，会试图展开这个值，而且展开过程会持续到提取一个具体的非类 promise 的最终值。
3. 传递一个非 promise、非 thenable 的立即值，会返回一个用这个值填充的 promise

总结：Promise.resolve()得到的是一个真正的 promise。

## promise 链

如果在 promise 链中出现错误，在链的任意位置若可以捕捉到这个错误，则下一个 promise 就可以把 promise 链拉回正轨。（错误会一直传下去直到被捕捉）

## 错误处理

### try...catch()无法跨异步操作

```js
function foo(cb) {
  setTimeout(function () {
    try {
      var a = baz.bar();
      cb(null, x); //成果
    } catch (err) {
      cb(err); //
    }
  }, 100);
}

foo(function (err, val) {
  if (err) {
    console.log(err);
  } else {
    console.log(val);
  }
});
```

只有在 baz.bar()调用会同步地立即成果或失败下，这里地 try..catch 才能工作。如果 baz.bar(）本身有自己的异步完成函数。其中的任何异步错误都将无法捕捉到。

### catch

```js
var p = Promise.resolve(42);
p.then(function fullfilled(msg) {
  //数字没有string函数，会抛出错误
  console.log(msg.toLowerCase());
}).catch(handleErrors);
```

## Promise 模式

### Promise.all([...])

并行执行

```js
var p1 = request("http://some.url.1/");
var p2 = request("http://some.irl.2/");

Promise.all([p1, p2])
  .then(function (msgs) {
    return request("http://some.url.3/");
  })
  .then(function (msg) {
    console.log(msg);
  });
```

Promise.all([...])返回的主 promise 在仅在所有的成员 promise 都完成之后才会完成。如果 promise 中有任何一个被拒绝的话，主 Promise.all([...])promise 就会立即被拒绝，并丢弃来自其他的 promise 的全部结果。所以要为所有 promise 关联拒绝/错误处理函数。

### Promise.race([...])

一旦有任何一个 Promise 决议为完成，Promise.race([...])就会完成，如果有一个拒绝，就会拒绝

### 变体

1. none([...]) 类似与 all([...]),不同的是完成和拒绝的情况互换了。所有的 Promise 都要被拒绝，即拒绝转化为完成值，反之亦然。
2. any([...]) 会忽略拒绝，只需完成一个而不是全部

3. first([...]) 类似与 any([...])的竞争，即只要第一个 Promise 完成，就会忽略后续的任何和完成

4. last([...]) 最后一个完成胜出

## 并发迭代

```js
var p1 = Promise.resolve(21);
var p2 = Promise.resolve(42);
var p3 = Promise.reject("oops");

Promise.map([p1, p2, p3], function (pr, done) {
  Promise.resolve(pr).then(function (v) {
    done(v * 2);
  }, done);
}).then(function (vals) {
  console.log(vals); //[42,84,"oops"]
});
```
