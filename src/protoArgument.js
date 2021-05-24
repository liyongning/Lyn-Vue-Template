/**
 * 通过拦截数组的七个方法来实现
 */

// 数组默认原型对象
const arrayProto = Array.prototype
// 以数组默认原型对象为原型创建一个新的对象
const arrayMethods = Object.create(arrayProto)
// 被 patch 的七个方法，通过拦截这七个方法来实现数组响应式
// 为什么是这七个方法？因为只有这七个方法是能更改数组本身的，像 cancat 这些方法都是会返回一个新的数组，不会改动数组本身
const methodsToPatch = ['push', 'pop', 'unshift', 'shift', 'splice', 'sort', 'reverse']

// 遍历 methodsToPatch
methodsToPatch.forEach(method => {
  // 拦截数组的七个方法，先完成本职工作，再额外完成响应式的工作
  Object.defineProperty(arrayMethods, method, {
    value: function(...args) {
      // 完成方法的本职工作，比如 this.arr.push(xx)
      const ret = arrayProto[method].apply(this, args)
      // 将来接着实现响应式相关的能力
      console.log('array reactive')
      // 新增的元素列表
      let inserted = []
      switch(method) {
        case 'push':
        case 'unshift':
          inserted = args
          break;
        case 'splice':
          // this.arr.splice(idx, num, x, x, x)
          inserted = args.slice(2)
          break;
      }
      // 如果数组有新增的元素，则对新增的元素进行响应式处理
      inserted.length && this.__ob__.observeArray(inserted)
      // 依赖通知更新
      this.__ob__.dep.notify()
      return ret
    },
    configurable: true,
    writable: true,
    enumerable: true
  })
})

/**
 * 覆盖数组（arr）的原型对象
 * @param {*} arr 
 */
export default function protoArgument(arr) {
  arr.__proto__ = arrayMethods
}