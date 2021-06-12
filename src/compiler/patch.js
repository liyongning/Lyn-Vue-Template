import Vue from "../index.js"
import { isReserveTag } from "../utils.js"

/**
 * 
 * @param {VNode} oldVnode 老的 VNode
 * @param {VNode} vnode 新的 VNode
 */
export default function patch(oldVnode, vnode) {
  if (oldVnode && !vnode) {
    // 老节点存在，新节点不存在，则销毁组件
    return
  }

  if (!oldVnode) { // oldVnode 不存在，说明是子组件首次渲染
    createElm(vnode)
  } else {
    if (oldVnode.nodeType) { // 真实节点，则表示首次渲染根组件
      // 父节点，即 body
      const parent = oldVnode.parentNode
      // 参考节点，即老的 vnode 的下一个节点 —— script，新节点要插在 script 的前面
      const referNode = oldVnode.nextSibling
      // 创建元素
      createElm(vnode, parent, referNode)
      // 移除老的 vnode
      parent.removeChild(oldVnode)
    } else {
      // 后续的更新
      patchVnode(oldVnode, vnode)
    }
  }
}

/**
 * 创建元素
 * @param {*} vnode VNode
 * @param {*} parent VNode 的父节点，真实节点
 * @returns 
 */
function createElm(vnode, parent, referNode) {
  // 记录节点的父节点
  vnode.parent = parent
  // 创建自定义组件，如果是非组件，则会继续后面的流程
  if (createComponent(vnode)) return

  const { attr, children, text } = vnode
  if (text) { // 文本节点
    // 创建文本节点，并插入到父节点内
    vnode.elm = createTextNode(vnode)
  } else { // 元素节点
    // 创建元素，在 vnode 上记录对应的 dom 节点
    vnode.elm = document.createElement(vnode.tag)
    // 给元素设置属性
    setAttribute(attr, vnode)
    // 递归创建子节点
    for (let i = 0, len = children.length; i < len; i++) {
      createElm(children[i], vnode.elm)
    }
  }
  // 如果存在 parent，则将创建的节点插入到父节点内
  if (parent) {
    const elm = vnode.elm
    if (referNode) {
      parent.insertBefore(elm, referNode)
    } else {
      parent.appendChild(elm)
    }
  }
}

/**
 * 创建自定义组件
 * @param {*} vnode
 */
function createComponent(vnode) {
  if (vnode.tag && !isReserveTag(vnode.tag)) { // 非保留节点，则说明是组件
    // 获取组件配置信息
    const { tag, context: { $options: { components } } } = vnode
    const compOptions = components[tag]
    const compIns = new Vue(compOptions)
    // 将父组件的 VNode 放到子组件的实例上
    compIns._parentVnode = vnode
    // 挂载子组件
    compIns.$mount()
    // 记录子组件 vnode 的父节点信息
    compIns._vnode.parent = vnode.parent
    // 将子组件添加到父节点内
    vnode.parent.appendChild(compIns._vnode.elm)
    return true
  }
}

/**
 * 创建文本节点
 * @param {*} textVNode 文本节点的 VNode
 */
function createTextNode(textVNode) {
  let { text } = textVNode, textNode = null
  if (text.expression) {
    // 存在表达式，这个表达式的值是一个响应式数据
    const value = textVNode.context[text.expression]
    textNode = document.createTextNode(typeof value === 'object' ? JSON.stringify(value) : String(value))
  } else {
    // 纯文本
    textNode = document.createTextNode(text.text)
  }
  return textNode
}

/**
 * 给节点设置属性
 * @param {*} attr 属性 Map 对象
 * @param {*} vnode
 */
function setAttribute(attr, vnode) {
  // 遍历属性，如果是普通属性，直接设置，如果是指令，则特殊处理
  for (let name in attr) {
    if (name === 'vModel') {
      // v-model 指令
      const { tag, value } = attr.vModel
      setVModel(tag, value, vnode)
    } else if (name === 'vBind') {
      // v-bind 指令
      setVBind(vnode)
    } else if (name === 'vOn') {
      // v-on 指令
      setVOn(vnode)
    } else {
      // 普通属性
      vnode.elm.setAttribute(name, attr[name])
    }
  }
}

/**
 * v-model 的原理
 * @param {*} tag 节点的标签名
 * @param {*} value 属性值
 * @param {*} node 节点
 */
function setVModel(tag, value, vnode) {
  const { context: vm, elm } = vnode
  if (tag === 'select') {
    // 下拉框，<select></select>
    Promise.resolve().then(() => {
      // 利用 promise 延迟设置，直接设置不行，
      // 因为这会儿 option 元素还没创建
      elm.value = vm[value]
    })
    elm.addEventListener('change', function () {
      vm[value] = elm.value
    })
  } else if (tag === 'input' && vnode.elm.type === 'text') {
    // 文本框，<input type="text" />
    elm.value = vm[value]
    elm.addEventListener('input', function () {
      vm[value] = elm.value
    })
  } else if (tag === 'input' && vnode.elm.type === 'checkbox') {
    // 选择框，<input type="checkbox" />
    elm.checked = vm[value]
    elm.addEventListener('change', function () {
      vm[value] = elm.checked
    })
  }
}

/**
 * v-bind 原理
 * @param {*} vnode
 */
function setVBind(vnode) {
  const { attr: { vBind }, elm, context: vm } = vnode
  for (let attrName in vBind) {
    elm.setAttribute(attrName, vm[vBind[attrName]])
    elm.removeAttribute(`v-bind:${attrName}`)
  }
}

/**
 * v-on 原理
 * @param {*} vnode 
 */
function setVOn(vnode) {
  const { attr: { vOn }, elm, context: vm } = vnode
  for (let eventName in vOn) {
    elm.addEventListener(eventName, function (...args) {
      vm.$options.methods[vOn[eventName]].apply(vm, args)
    })
  }
}

/**
 * 对比新老节点，找出其中的不同，然后更新老节点
 * @param {*} oldVnode 老节点的 vnode
 * @param {*} vnode 新节点的 vnode
 */
function patchVnode(oldVnode, vnode) {
  // 如果新老节点相同，则直接结束
  if (oldVnode === vnode) return

  // 将老 vnode 上的真实节点同步到新的 vnode 上，否则，后续更新的时候会出现 vnode.elm 为空的现象
  vnode.elm = oldVnode.elm

  // 走到这里说明新老节点不一样，则获取它们的孩子节点，比较孩子节点
  const ch = vnode.children
  const oldCh = oldVnode.children

  if (!vnode.text) { // 新节点不存在文本节点
    if (ch && oldCh) { // 说明新老节点都有孩子
      // diff
      updateChildren(ch, oldCh)
    } else if (ch) { // 老节点没孩子，新节点有孩子
      // 增加孩子节点
    } else { // 新节点没孩子，老节点有孩子
      // 删除这些孩子节点
    }
  } else { // 新节点存在文本节点
    if (vnode.text.expression) { // 说明存在表达式
      // 获取表达式的新值
      const value = JSON.stringify(vnode.context[vnode.text.expression])
      // 旧值
      try {
        const oldValue = oldVnode.elm.textContent
        if (value !== oldValue) { // 新老值不一样，则更新
          oldVnode.elm.textContent = value
        }
      } catch {
        // 防止更新时遇到插槽，导致报错
        // 目前不知道插槽数据的响应式更新
      }
    }
  }
}

/**
 * diff，比对孩子节点，找出不同点，然后将不同点更新到老节点上
 * @param {*} ch 新 vnode 的所有孩子节点
 * @param {*} oldCh 老 vnode 的所有孩子节点
 */
function updateChildren(ch, oldCh) {
  // 四个游标
  // 新孩子节点的开始索引，叫 新开始
  let newStartIdx = 0
  // 新结束
  let newEndIdx = ch.length - 1
  // 老开始
  let oldStartIdx = 0
  // 老结束
  let oldEndIdx = oldCh.length - 1
  // 循环遍历新老节点，找出节点中不一样的地方，然后更新
  while (newStartIdx <= newEndIdx || oldStartIdx <= oldEndIdx) { // 根为 web 中的 DOM 操作特点，做了四种假设，降低时间复杂度
    // 新开始节点
    const newStartNode = ch[newStartIdx]
    // 新结束节点
    const newEndNode = ch[newEndIdx]
    // 老开始节点
    const oldStartNode = oldCh[oldStartIdx]
    // 老结束节点
    const oldEndNode = oldCh[oldEndIdx]
    if (sameVNode(newStartNode, oldStartNode)) { // 假设新开始和老开始是同一个节点
      // 对比这两个节点，找出不同然后更新
      patchVnode(oldStartNode, newStartNode)
      // 移动游标
      oldStartIdx++
      newStartIdx++
    } else if (sameVNode(newStartNode, oldEndNode)) { // 假设新开始和老结束是同一个节点
      patchVnode(oldEndNode, newStartNode)
      // 将老结束移动到新开始的位置
      oldEndNode.elm.parentNode.insertBefore(oldEndNode.elm, oldCh[newStartIdx].elm)
      // 移动游标
      newStartIdx++
      oldEndIdx--
    } else if (sameVNode(newEndNode, oldStartNode)) { // 假设新结束和老开始是同一个节点
      patchVnode(oldStartNode, newEndNode)
      // 将老开始移动到新结束的位置
      oldStartNode.elm.parentNode.insertBefore(oldStartNode.elm, oldCh[newEndIdx].elm.nextSibling)
      // 移动游标
      newEndIdx--
      oldStartIdx++
    } else if (sameVNode(newEndNode, oldEndNode)) { // 假设新结束和老结束是同一个节点
      patchVnode(oldEndNode, newEndNode)
      // 移动游标
      newEndIdx--
      oldEndIdx--
    } else {
      // 上面几种假设都没命中，则老老实的遍历，找到那个相同元素
    }
  }
  // 跳出循环，说明有一个节点首先遍历结束了
  if (newStartIdx < newEndIdx) { // 说明老节点先遍历结束，则将剩余的新节点添加到 DOM 中

  }
  if (oldStartIdx < oldEndIdx) { // 说明新节点先遍历结束，则将剩余的这些老节点从 DOM 中删掉

  }
}

/**
 * 判断两个节点是否相同
 * 这里的判读比较简单，只做了 key 和 标签的比较
 */
function sameVNode(n1, n2) {
  return n1.key == n2.key && n1.tag === n2.tag
}