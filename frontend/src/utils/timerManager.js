/**
 * TimerManager - 统一的定时/延时任务管理器
 *
 * 用法：
 *   timerManager.register('my-task', { interval: 5000, handler: () => {} })
 *   timerManager.start('my-task')
 *   timerManager.stop('my-task')
 *   timerManager.stopAll()
 */

const timerManager = (() => {
  // Map<taskId, { timerId, config }>
  const _tasks = new Map()

  /**
   * 注册一个定时任务（注册后不自动启动，需调用 start）
   * @param {string}   id            - 唯一任务标识
   * @param {object}   config
   * @param {number}   config.interval  - 间隔毫秒数
   * @param {Function} config.handler   - 每次触发时执行的异步或同步函数
   * @param {boolean}  [config.immediate=false] - 注册后立即执行一次（start时）
   */
  function register(id, config) {
    if (_tasks.has(id)) {
      stop(id) // 先停掉旧的同名任务
    }
    _tasks.set(id, { timerId: null, config })
    console.log(`⏱️ [TimerManager] Registered task: ${id} (interval=${config.interval}ms)`)
  }

  /**
   * 启动已注册的任务
   * @param {string} id
   */
  function start(id) {
    const task = _tasks.get(id)
    if (!task) {
      console.warn(`⚠️ [TimerManager] Task not found: ${id}`)
      return
    }
    if (task.timerId !== null) {
      console.warn(`⚠️ [TimerManager] Task already running: ${id}`)
      return
    }

    const { interval, handler, immediate } = task.config

    if (immediate) {
      handler()
    }

    const timerId = setInterval(() => {
      handler()
    }, interval)

    task.timerId = timerId
    console.log(`▶️ [TimerManager] Started task: ${id}`)
  }

  /**
   * 停止某个任务
   * @param {string} id
   */
  function stop(id) {
    const task = _tasks.get(id)
    if (!task || task.timerId === null) return
    clearInterval(task.timerId)
    task.timerId = null
    console.log(`⏹️ [TimerManager] Stopped task: ${id}`)
  }

  /**
   * 停止所有任务
   */
  function stopAll() {
    for (const id of _tasks.keys()) {
      stop(id)
    }
    console.log('⏹️ [TimerManager] All tasks stopped')
  }

  /**
   * 注销任务（停止并移除）
   * @param {string} id
   */
  function unregister(id) {
    stop(id)
    _tasks.delete(id)
    console.log(`🗑️ [TimerManager] Unregistered task: ${id}`)
  }

  /**
   * 更新任务配置（先停止，再用新配置重新注册，不自动重启）
   * @param {string} id
   * @param {object} config
   */
  function update(id, config) {
    const task = _tasks.get(id)
    const wasRunning = task && task.timerId !== null
    unregister(id)
    register(id, config)
    if (wasRunning) {
      start(id)
    }
  }

  /**
   * 是否正在运行
   * @param {string} id
   * @returns {boolean}
   */
  function isRunning(id) {
    const task = _tasks.get(id)
    return !!task && task.timerId !== null
  }

  return { register, start, stop, stopAll, unregister, update, isRunning }
})()

export default timerManager
