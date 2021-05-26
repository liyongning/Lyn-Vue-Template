import compileNode from './compileNode.js'
/**
 * 编译器
 */
export default function mount(vm) {
  // 获取 el 选择器所表示的元素
  let el = document.querySelector(vm.$options.el)

  // 编译节点
  compileNode(Array.from(el.childNodes), vm)
}
