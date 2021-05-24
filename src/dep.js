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

/**
 * 收集 watcher
 * 在发生读取操作时（vm.xx) && 并且 Dep.target 不为 null 时进行依赖收集
 */
Dep.prototype.depend = function () {
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