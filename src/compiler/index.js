import compileToFunction from "./compileToFunction.js"

/**
 * 编译器
 */
export default function mount(vm) {
  if (!vm.$options.render) { // 没有提供 render 选项，则编译生成 render 函数
    // 获取模版
    let template = ''

    if (vm.$options.template) {
      // 模版存在
      template = vm.$options.template
    } else if (vm.$options.el) {
      // 存在挂载点
      template = document.querySelector(vm.$options.el).outerHTML
    }

    // 生成渲染函数
    const render = compileToFunction(template)
    // 将渲染函数挂载到 $options 上
    vm.$options._render = render
  }
}