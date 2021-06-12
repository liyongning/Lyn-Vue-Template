import Watcher from "./watcher.js"

export default function initComputed(vm) {
  // 获取 computed 配置项
  const computed = vm.$options.computed
  // 记录 watcher
  const watcher = vm._watcher = Object.create(null)
  // 遍历 computed 对象
  for (let key in computed) {
    // 实例化 Watcher，回调函数默认懒执行
    watcher[key] = new Watcher(computed[key], { lazy: true }, vm)
    // 将 computed 的属性 key 代理到 Vue 实例上
    defineComputed(vm, key)
  }
}

/**
 * 将计算属性代理到 Vue 实例上
 * @param {*} vm Vue 实例
 * @param {*} key computed 的计算属性
 */
function defineComputed(vm, key) {
  // 属性描述符
  const descriptor = {
    get: function () {
      const watcher = vm._watcher[key]
      if (watcher.dirty) { // 说明当前 computed 回调函数在本次渲染周期内没有被执行过
        // 执行 evalute，通知 watcher 执行 computed 回调函数，得到回调函数返回值
        watcher.evalute()
      }
      return watcher.value
    },
    set: function () {
      console.log('no setter')
    }
  }
  // 将计算属性代理到 Vue 实例上
  Object.defineProperty(vm, key, descriptor)
}