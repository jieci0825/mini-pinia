/**
 * 添加订阅
 */
export function addSubscription(subscriptions, callback) {
  subscriptions.push(callback)

  // 返回一个移除订阅的函数
  return function removeSubscription() {
    const index = subscriptions.indexOf(callback)
    if (index > -1) {
      subscriptions.splice(index, 1)
    }
  }
}

/**
 * 触发订阅
 */
export function triggerSubscriptions(subscriptions, ...args) {
  subscriptions.forEach(callback => callback(...args))
}
