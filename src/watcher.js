import { queueWatcher } from "./asyncUpdateQueue.js"
import { popTarget, pushTarget } from "./dep.js"

// 用来标记 watcher
let uid = 0
/**
 * @param {*} cb 回调函数，负责更新 DOM 的回调函数
 * @param {*} options watcher 的配置项
 */
export default function Watcher(cb, options = {}, vm = null) {
  // 标识 watcher
  this.uid = uid++
  // 备份 cb 函数
  this._cb = cb
  // 备份配置项
  this.options = options
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
  pushTarget(this)
  this.value = this._cb.apply(this.vm)
  popTarget()
}

/**
 * 响应式数据更新时，dep 通知 watcher 执行 update 方法，
 * 让 update 方法执行 this._cb 函数更新 DOM
 */
Watcher.prototype.update = function () {
  if (this.options.lazy) { // 懒执行，比如 computed 计算属性
    // 将 dirty 置为 true，当页面重新渲染获取计算属性时就可以执行 evalute 方法获取最新的值了
    this.dirty = true
  } else {
    // 将 watcher 放入异步 watcher 队列
    queueWatcher(this)
  }
}

/**
 * 由刷新 watcher 队列的函数调用，负责执行 watcher.get 方法
 */
Watcher.prototype.run = function () {
  this.get()
}

Watcher.prototype.evalute = function () {
  // 执行 get，触发计算函数 (cb) 的执行
  this.get()
  // 将 dirty 置为 false，实现一次刷新周期内 computed 实现缓存
  this.dirty = false
}