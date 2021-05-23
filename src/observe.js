import Observer from "./observer.js"

/**
 * 通过 Observer 类为对象设置响应式能力
 * @returns Observer 实例
 */
export default function observe(value) {
  // 避免无限递归
  // 当 value 不是对象或者 value 是 Observer 实例时，直接结束递归
  if (typeof value !== 'object' || value instanceof Observer) return

  // value.__ob__ 是 Observer 实例
  // 如果 value.__ob__ 属性已经存在，说明 value 对象已经具备响应式能力，直接返回已有的响应式对象
  if (value.__ob__) return value.__ob__

  // 返回 Observer 实例
  return new Observer(value)
}