import observe from "./observe.js"
import { proxy } from "./utils.js"

/**
 * 1、初始化 options.data
 * 2、代理 data 对象上的各个属性到 Vue 实例
 * 3、给 data 对象上的各个属性设置响应式能力
 * @param {*} vm 
 */
export default function initData(vm) {
  // 获取 data 选项
  let { data } = vm.$options
  // 设置 vm._data 选项，保证它的值肯定是一个对象
  if (!data) {
    vm._data = {}
  } else {
    vm._data = typeof data === 'function' ? data() : data
  }
  // 代理，将 data 对象上的的各个属性代理到 Vue 实例上，支持 通过 this.xx 的方式访问
  for (let key in vm._data) {
    proxy(vm, '_data', key)
  }
  // 设置响应式
  observe(vm._data)
}