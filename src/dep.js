/**
 * Dep
 * Vue1.0 中 key 和 Dep 是一一对应关系，举例来说：
 * new Vue({
 *   data() {
 *     return {
 *       t1: xx,
 *       t2: {
 *         tt2: xx
 *       },
 *       arr: [1, 2, 3, { t3: xx }]
 *     }
 *   }
 * })
 * data 函数 return 回来的对象是一个 dep
 * 对象中的 key => t1、t2、tt2、arr、t3 都分别对应一个 dep
 */
export default function Dep() {
  // 存储当前 dep 实例收集的所有 watcher
  this.watchers = []
}

// Dep.target 是一个静态属性，值为 null 或者 watcher 实例
// 在实例化 Watcher 时进行赋值，待依赖收集完成后在 Watcher 中又重新赋值为 null
Dep.target = null
// 存储所有的 Dep.target
// 为什么会有多个 Dep.target?
// 组件会产生一个渲染 Watcher，在渲染的过程中如果处理到用户 Watcher，
// 比如 computed 计算属性，这时候会执行 evalute -> get
// 假如直接赋值 Dep.target，那 Dep.target 的上一个值 —— 渲染 Watcher 就会丢失
// 造成在 computed 计算属性之后渲染的响应式数据无法完成依赖收集
const targetStack = []

/**
 * 收集 watcher
 * 在发生读取操作时（vm.xx) && 并且 Dep.target 不为 null 时进行依赖收集
 */
Dep.prototype.depend = function () {
  // 防止 Watcher 实例被重复收集
  if (this.watchers.includes(Dep.target)) return
  // 收集 Watcher 实例
  this.watchers.push(Dep.target)
}

/**
 * dep 通知自己收集的所有 watcher 执行更新函数
 */
Dep.prototype.notify = function () {
  for (let watcher of this.watchers) {
    watcher.update()
  }
}

/**
 * 备份本次传递进来的 Watcher，并将其赋值给 Dep.target
 * @param {*} target Watcher 实例
 */
export function pushTarget(target) {
  // 备份传递进来的 Watcher
  targetStack.push(target)
  Dep.target = target
}

/**
 * 将 Dep.target 重置为上一个 Watcher 或者 null
 */
export function popTarget() {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}