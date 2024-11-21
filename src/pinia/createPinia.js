import { effectScope, markRaw, ref } from 'vue'
import { PiniaSymbol } from './rootStore'

export function createPinia() {
  // 创建一个响应式作用域
  //  - 这个作用域可以包含多个响应式副作用（effect），并且这些副作用可以一起被停止或清除
  //  - 即将副作用应该一起被管理
  //  - 参数传入 true 表示不会收集子级的 effectScope
  const scope = effectScope()

  // run 方法的返回值就是这个 fn 的返回结果
  const state = scope.run(() => ref({}))

  // 通过 markRaw 方法让其在 Vue 的响应式系统中不被追踪。即不会对这个对象进行依赖收集和响应式更新。
  //  - 并通过 markRaw 方法将这个对象标记为不可变对象，就不会被外部修改为一个响应式对象
  const pinia = markRaw({
    install(app) {
      pinia._app = app
      // 将 pinia 实例暴露到 app 上，所有读组件都可以通过 inject 注入进来
      app.provide(PiniaSymbol, pinia)
      // 将pinia实例挂载到全局属性上
      app.config.globalProperties.$pinia = pinia
    },
    _app: null,
    // pinia 完整的状态
    state,
    // 管理整个 effectScope
    _e: scope,
    // 存储所有的 store
    _s: new Map()
  })

  return pinia
}
