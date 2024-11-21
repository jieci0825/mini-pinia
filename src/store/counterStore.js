import { defineStore } from '@/pinia'
import { computed, reactive, toRefs } from 'vue'

// options
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

// function
// export const useCounterStore = defineStore('counter', store => {
//   const state = reactive({
//     count: 0,
//     userInfo: {
//       name: '张三',
//       age: 18
//     }
//   })

//   const increase = () => {
//     state.count++
//   }

//   const doubleCount = computed(() => {
//     return state.count * 2
//   })

//   return {
//     ...toRefs(state),
//     increase,
//     doubleCount
//   }
// })
