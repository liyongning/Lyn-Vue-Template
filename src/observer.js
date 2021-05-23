import defineReactive from "./defineReactive.js"
import observe from "./observe.js"
import protoArgument from "./protoArgument.js"

/**
 * 为普通对象或者数组设置响应式的入口 
 */
export default function Observer(value) {
  // 为对象设置 __ob__ 属性，值为 this，标识当前对象已经是一个响应式对象了
  value.__ob__ = this

  if (Array.isArray(value)) {
    // 数组响应式
    protoArgument(value)
    this.observeArray(value)
  } else {
    // 对象响应式
    this.walk(value)
  }
}

/**
 * 遍历对象的每个属性，为这些属性设置 getter、setter 拦截
 */
Observer.prototype.walk = function (obj) {
  for (let key in obj) {
    defineReactive(obj, key, obj[key])
  }
}

// 遍历数组的每个元素，为每个元素设置响应式
// 其实这里是为了处理元素为对象的情况，以达到 this.arr[idx].xx 是响应式的目的
Observer.prototype.observeArray = function (arr) {
  for (let item of arr) {
    observe(item)
  }
}