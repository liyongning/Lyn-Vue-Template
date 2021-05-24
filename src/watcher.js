import Dep from "./dep.js"

/**
 * @param {*} cb 回调函数，负责更新 DOM 的回调函数
 */
export default function Watcher(cb) {
  // 备份 cb 函数
  this._cb = cb
  // 赋值 Dep.target
  Dep.target = this
  // 执行 cb 函数，cb 函数中会发生 vm.xx 的属性读取，进行依赖收集
  cb()
  // 依赖收集完成，Dep.target 重新赋值为 null，防止重复收集
  Dep.target = null
}

/**
 * 响应式数据更新时，dep 通知 watcher 执行 update 方法，
 * 让 update 方法执行 this._cb 函数更新 DOM
 */
Watcher.prototype.update = function () {
  this._cb()
}