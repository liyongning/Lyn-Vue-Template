/**
 * VNode
 * @param {*} tag 标签名
 * @param {*} attr 属性 Map 对象
 * @param {*} children 子节点组成的 VNode
 * @param {*} text 文本节点的 ast 对象
 * @param {*} context Vue 实例
 * @returns VNode
 */
export default function VNode(tag, attr, children, context, text = null) {
  return {
    // 标签
    tag,
    // 属性 Map 对象
    attr,
    // 父节点
    parent: null,
    // 子节点的组成的 Vnode 数组
    children,
    // 文本节点的 Ast 对象
    text,
    // Vnode 的真实节点
    elm: null,
    // Vue 上下文
    context
  }
}