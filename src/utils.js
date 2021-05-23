/**
 * 工具方法集合
 */

/**
 * 将 key 代理到 target 上，
 * 比如 代理 this._data.xx 为 this.xx
 * @param {*} target 目标对象，比如 vm
 * @param {*} sourceKey 原始 key，比如 _data
 * @param {*} key 代理的原始对象上的指定属性，比如 _data.xx
 */
export function proxy(target, sourceKey, key) {
  Object.defineProperty(target, key, {
    // target.key 的读取操作实际上返回的是 target.sourceKey.key
    get() {
      return target[sourceKey][key]
    },
    // target.key 的赋值操作实际上是 target.sourceKey.key = newV
    set(newV) {
      target[sourceKey][key] = newV
    }
  })
}
