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

/**
 * 是否为自闭合标签，内置一些自闭合标签，为了处理简单
 */
export function isUnaryTag(tagName) {
  const unaryTag = ['input']
  return unaryTag.includes(tagName)
}

/**
 * 是否为平台保留节点
 */
export function isReserveTag(tagName) {
  const reserveTag = ['div', 'h3', 'span', 'input', 'select', 'option', 'p', 'button', 'template']
  return reserveTag.includes(tagName)
}