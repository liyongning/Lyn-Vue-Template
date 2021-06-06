import VNode from "./vnode.js"

/**
 * 在 Vue 实例上安装运行时的渲染帮助函数，比如 _c、_v，这些函数会生成 Vnode
 * @param {VueContructor} target Vue 实例
 */
export default function renderHelper(target) {
  target._c = createElement
  target._v = createTextNode
}

/**
 * 根据标签信息创建 Vnode
 * @param {string} tag 标签名 
 * @param {Map} attr 标签的属性 Map 对象
 * @param {Array<Render>} children 所有的子节点的渲染函数
 */
function createElement(tag, attr, children) {
  return VNode(tag, attr, children, this)
}

/**
 * 生成文本节点的 VNode
 * @param {*} textAst 文本节点的 AST 对象
 */
function createTextNode(textAst) {
  return VNode(null, null, null, this, textAst)
}