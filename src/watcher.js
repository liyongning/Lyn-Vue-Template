import Dep from "./dep.js"

/**
 * @param {*} cb 回调函数，负责更新 DOM 的回调函数
 * @param {*} options watcher 的配置项
 */
export default function Watcher(cb, options = {}, vm = null) {
  // 备份 cb 函数
  this._cb = cb
  // 回调函数执行后的值
  this.value = null
  // computed 计算属性实现缓存的原理，标记当前回调函数在本次渲染周期内是否已经被执行过
  this.dirty = !!options.lazy
  // Vue 实例
  this.vm = vm
  // 非懒执行时，直接执行 cb 函数，cb 函数中会发生 vm.xx 的属性读取，从而进行依赖收集
  !options.lazy && this.get()
}

/**
 * 负责执行 Watcher 的 cb 函数
 * 执行时进行依赖收集
 */
Watcher.prototype.get = function () {
  Dep.target = this
  this.value = this._cb.apply(this.vm)
  Dep.target = null
}

/**
 * 响应式数据更新时，dep 通知 watcher 执行 update 方法，
 * 让 update 方法执行 this._cb 函数更新 DOM
 */
Watcher.prototype.update = function () {
  // 通过 Promise，将 this._cb 的执行放到 this.dirty = true 的后面
  // 否则，在点击按钮时，computed 属性的第一次计算会无法执行，
  // 因为 this._cb 执行的时候，会更新组件，获取计算属性的值的时候 this.dirty 依然是
  // 上一次的 false，导致无法得到最新的的计算属性的值
  // 不过这个在有了异步更新队列之后就不需要了，当然，毕竟异步更新对象的本质也是 Promise
  Promise.resolve().then(() => {
    this._cb()
  })
  // 执行完 _cb 函数，DOM 更新完毕，进入下一个渲染周期，所以将 dirty 置为 false
  // 当再次获取 计算属性 时就可以重新执行 evalute 方法获取最新的值了
  this.dirty = true
}

Watcher.prototype.evalute = function () {
  // 执行 get，触发计算函数 (cb) 的执行
  this.get()
  // 将 dirty 置为 false，实现一次刷新周期内 computed 实现缓存
  this.dirty = false
}