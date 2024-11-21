import { defineStore } from '@/pinia'
import { computed, reactive, toRefs } from 'vue'

// options
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    userInfo: {
      name: '张三',
      age: 18
    },
    fruits: ['苹果', '香蕉', '橘子']
  }),
  actions: {
    increase() {
      // * success case:
      this.count++
      return 'hello world'

      // * error case:
      // return new Promise((resolve, reject) => {
      //   setTimeout(() => {
      //     reject('this is error')
      //   }, 2000)
      // })
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
//     fruits: ['苹果', '香蕉', '橘子']
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
