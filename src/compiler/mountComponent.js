import Vue from '../index.js'
import Watcher from '../watcher.js'
/**
 * @param {*} vm Vue 实例
 */
export default function mountComponent(vm) {
  // 更新组件的的函数
  const updateComponent = () => {
    vm._update(vm._render())
  }

  // 实例化一个渲染 Watcher，当响应式数据更新时，这个更新函数会被执行
  new Watcher(updateComponent)
}

/**
 * 负责执行 vm.$options.render 函数
 */
Vue.prototype._render = function () {
  // 给 render 函数绑定 this 上下文为 Vue 实例
  return this.$options.render.apply(this)
}

Vue.prototype._update = function (vnode) {
  // 老的 VNode
  const prevVNode = this._vnode
  // 新的 VNode
  this._vnode = vnode
  if (!prevVNode) {
    // 老的 VNode 不存在，则说明时首次渲染根组件
    this.$el = this.__patch__(this.$el, vnode)
  } else {
    // 后续更新组件或者首次渲染子组件，都会走这里
    this.$el = this.__patch__(prevVNode, vnode)
  }
}
