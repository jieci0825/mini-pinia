import {
  computed,
  effectScope,
  getCurrentInstance,
  inject,
  reactive,
  toRefs
} from 'vue'
import { extend, isFunction, isObject, isString } from './utils'
import { PiniaSymbol } from './rootStore'

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

function createSetupStore(id, setup, pinia) {
  // 每一个 store 都应该是一个响应式对象
  const store = reactive({})

  // 单独的 effectScope
  let scope
  const setupStore = pinia._e.run(() => {
    scope = effectScope()
    // scope.run 返回值就是这个回调函数的返回值
    return scope.run(() => setup())
  })

  function wrapActions(action) {
    return function (...args) {
      // 触发 actions 的时候可以加入一些其他逻辑
      const result = action.apply(store, args)
      return result
    }
  }

  // 处理 actions 中函数，绑定 this 到 store 上
  for (const key in setupStore) {
    const value = setupStore[key]
    if (isFunction(value)) {
      setupStore[key] = wrapActions(value)
    }
  }

  extend(store, setupStore)

  // 将处理好的 store 存储到 pinia 实例映射表中
  pinia._s.set(id, store)

  return store
}

function createOptionsStore(id, options, pinia) {
  const { state, actions, getters } = options

  const store = createSetupStore(id, setup, pinia)

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
