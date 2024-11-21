import { isArray, isObject } from './utils'

export function mapState(useStore, keysOrMapper) {
  keysOrMapper = normalization(keysOrMapper)
  // 经过上面的参数标准化之后
  // 就会得到一个对象 {k:v}
  //  - k 表示在页面组件中需要使用的名称，v 表示在 store 中对应的名称

  const keys = Object.keys(keysOrMapper) // ['count', 'doubleCount', 'f']
  // 返回一个对象
  const result = keys.reduce((acc, key) => {
    // 获取实际在 store 中的 key
    const storeKey = keysOrMapper[key]
    // computed 中配置的计算属性，其实就是要返回一个getter函数即可
    acc[key] = function () {
      const store = useStore()
      return store[storeKey]
    }
    return acc
  }, {})

  return result
}

function normalization(keysOrMapper) {
  if (isArray(keysOrMapper)) {
    return keysOrMapper.reduce((acc, key) => {
      acc[key] = key
      return acc
    }, {})
  } else if (isObject(keysOrMapper)) {
    return keysOrMapper
  } else {
    throw new Error('mapHelper 函数第二个参数需要为数组或者对象')
  }
}

export function mapActions(useStore, keysOrMapper) {
  keysOrMapper = normalization(keysOrMapper)

  const keys = Object.keys(keysOrMapper)
  const result = keys.reduce((acc, key) => {
    const storeKey = keysOrMapper[key]
    acc[key] = function (...args) {
      const store = useStore()
      // 此时在 actions 中拿到的就是一个函数
      const fn = store[storeKey]
      return fn.apply(store, args)
    }
    return acc
  }, {})

  return result
}
