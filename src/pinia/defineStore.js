import {
  computed,
  effectScope,
  getCurrentInstance,
  inject,
  isRef,
  reactive,
  toRefs,
  watch
} from 'vue'
import {
  extend,
  hasChanged,
  hasOwn,
  isFunction,
  isObject,
  isPromise,
  isString
} from './utils'
import { PiniaSymbol } from './rootStore'
import { addSubscription, triggerSubscriptions } from './publishSubscribe'

export function defineStore(idOrOptions, setup) {
  // 处理参数
  const { id, options } = normalization(idOrOptions, setup)

  // 处理之后的 id 是字符串，options 是对象或者函数

  function useStore() {
    const currentInstance = getCurrentInstance()
    if (!currentInstance) {
      console.warn('useStore 必须在组件中使用')
      return
    }

    const isSetupStore = isFunction(setup)

    // 获取全局的 pinia 实例
    const piniaIns = inject(PiniaSymbol)

    // 如果当前 id 没有注册过，则注册
    if (!piniaIns._s.has(id)) {
      // 不是 setup 函数，则表示是 options 语法
      if (!isSetupStore) {
        createOptionsStore(id, options, piniaIns)
      } else {
        // 是 setup 函数，则表示第二参数传递的是函数
        createSetupStore(id, setup, piniaIns)
      }
    }

    // 从映射表中根据 id 取出处理好的 store
    const store = piniaIns._s.get(id)
    return store
  }

  return useStore
}

function mergeReactiveObject(target, partialState) {
  for (const key in partialState) {
    // 排除掉原型链上的属性
    if (!hasOwn(partialState, key)) {
      continue
    }

    const oldValue = target[key]
    const newValue = partialState[key]

    // 新旧值都是对象，且不能是 ref 才进行递归处理
    if (isObject(newValue) && isObject(oldValue) && !isRef(newValue)) {
      target[key] = mergeReactiveObject(oldValue, newValue)
    } else {
      // 两个值发生变化时才更新
      if (hasChanged(oldValue, newValue)) {
        target[key] = newValue
      }
    }
  }

  return target
}

function createSetupStore(id, setup, pinia) {
  function $patch(partialStateOrMutation) {
    if (isFunction(partialStateOrMutation)) {
      partialStateOrMutation(pinia.state.value[id])
    } else if (isObject(partialStateOrMutation)) {
      mergeReactiveObject(pinia.state.value[id], partialStateOrMutation)
    }
  }

  function $reset() {
    // $reset 方法无法在 setup 函数中调用(即不支持 composition api 写法，只能在 options api 写法的时候使用)，因为无法追溯原有的状态
    // 素以这里如果调用 $reset 方法，就弹出一个报错
    throw new Error('$reset 只能在 options api 中使用')
  }

  function $subscribe(callback, options) {
    scope.run(() => {
      watch(
        pinia.state.value[id],
        (newValue, oldValue) => {
          // todo 行为可以完善的更详细
          callback({ type: 'direct', id }, newValue)
        },
        options
      )
    })
  }

  let actionSubscriptions = []
  function $onAction(callback) {
    addSubscription.bind(null, actionSubscriptions, callback)()
  }

  // 销毁 store
  function $dispose() {
    // 停止 effectScope
    scope.stop()
    // 清空 actionSubscriptions
    actionSubscriptions = []
    // 删除 store
    pinia._s.delete(id)
  }

  const partialStore = {
    $patch,
    $reset,
    $subscribe,
    $onAction,
    $dispose
  }

  // 每一个 store 都应该是一个响应式对象
  const store = reactive(partialStore)

  Object.defineProperty(store, '$state', {
    get: () => pinia.state.value[id],
    set: value => {
      store.$patch(state => {
        extend(state, value)
      })
    }
  })

  // 单独的 effectScope
  let scope
  const setupStore = pinia._e.run(() => {
    scope = effectScope()
    // scope.run 返回值就是这个回调函数的返回值
    return scope.run(() => setup())
  })

  function wrapActions(name, action) {
    return function (...args) {
      // 触发 actions 的时候可以加入一些其他逻辑
      const afterCallbacks = []
      const onErrorCallbacks = []

      function after(callback) {
        afterCallbacks.push(callback)
      }

      function onError(callback) {
        onErrorCallbacks.push(callback)
      }

      // name 即为 actions 中的函数名
      triggerSubscriptions(actionSubscriptions, { name, store, after, onError })

      let result
      try {
        result = action.apply(store, args)
      } catch (error) {
        triggerSubscriptions(onErrorCallbacks, error)
      }

      // 如果这个 aciotns 返回的是一个 Promise，那么就等待 Promise 执行完成后再触发回调
      if (isPromise(result)) {
        result
          .then(res => {
            // 成功
            triggerSubscriptions(afterCallbacks, res)
          })
          .catch(error => {
            // 失败
            triggerSubscriptions(onErrorCallbacks, error)
            return Promise.reject(error)
          })
      } else {
        // 如果 actions 返回的不是 Promise，那么直接触发回调
        triggerSubscriptions(afterCallbacks, result)
      }

      return result
    }
  }

  // 处理 actions 中函数，绑定 this 到 store 上
  for (const key in setupStore) {
    const value = setupStore[key]
    if (isFunction(value)) {
      setupStore[key] = wrapActions(key, value)
    }
  }

  extend(store, setupStore)

  // 将处理好的 store 存储到 pinia 实例映射表中
  pinia._s.set(id, store)

  return store
}

function createOptionsStore(id, options, pinia) {
  // state 如果有一定是一个函数
  const { state, actions, getters } = options

  const store = createSetupStore(id, setup, pinia)
  // options api 单独重写 $reset 方法
  store.$reset = function () {
    // 因为 state 是函数，每次调用都会返回一个新的对象，所以这里再次调用就会得到一个初始状态
    const newState = state ? state() : {}
    store.$patch($state => {
      extend($state, newState)
    })
  }

  function setup() {
    pinia.state.value[id] = state ? state() : {}

    // 这里转成 ref 也不会影响通过 store 取值
    // store 是一个 reactive，reactive 里面有 ref 数据时，会拆包，及外部访问也不需要 .value
    const localState = toRefs(pinia.state.value[id])

    const _getters = Object.keys(getters || {}).reduce(
      (computedGetter, name) => {
        computedGetter[name] = computed(() => {
          return getters[name].call(store, store)
        })

        return computedGetter
      },
      {}
    )

    return extend(localState, actions, _getters)
  }
}

function normalization(idOrOptions, setup) {
  let id
  let options
  if (isString(idOrOptions)) {
    id = idOrOptions
    options = setup
  } else if (isObject(idOrOptions)) {
    id = idOrOptions.id
    options = idOrOptions
  }
  return { id, options }
}
