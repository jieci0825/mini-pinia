import { defineStore } from '@/pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    userInfo: {
      name: '张三',
      age: 18
    }
  }),
  actions: {
    increase() {
      this.count++
    }
  },
  getters: {
    doubleCount: state => {
      return state.count * 2
    }
  }
})
