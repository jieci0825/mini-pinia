<script setup>
import { useCounterStore } from './store/counterStore'

const useCounter = useCounterStore()

const { increase: inc } = useCounter

const increase = () => {
  // useCounter.count++
  // useCounter.increase()
  inc()
}

const handleClick = () => {
  // 对象式
  // const fruits = [...useCounter.fruits, '黄桃', '西瓜']
  // useCounter.$patch({
  //   count: useCounter.count + 1,
  //   fruits
  // })

  // 函数式
  useCounter.$patch(state => {
    state.count++
    state.fruits.push('葡萄', '甜瓜')
  })
}

const reset = () => {
  useCounter.$reset()
}

// useCounter.$subscribe((mutation, state) => {
//   console.log(state)
//   console.log('行为：', mutation)
// })

useCounter.$onAction(({ name, store, after, onError }) => {
  console.log(`actions【${name}】开始执行`)
  after(res => {
    console.log('状态更新执行完毕了-after: ', res)
  })
  onError(err => {
    console.log('状态更新执行失败-onError: ', err)
  })
})
</script>

<template>
  <div class="container">
    <h1>hello vue</h1>
    <div>
      <span>计数：</span>
      <span>{{ useCounter.count }}</span>
    </div>
    <div>
      <span>双倍：</span>
      <span>{{ useCounter.doubleCount }}</span>
    </div>
    <div>
      <span>水果：</span>
      <span v-for="(fruit, idx) in useCounter.fruits" :key="idx"
        >{{ fruit }}{{ idx < useCounter.fruits.length - 1 ? '、' : '' }}</span
      >
    </div>
    <div class="btns">
      <button @click="reset">重置</button>
      <button @click="handleClick">批量增加</button>
      <button @click="increase">计数 +1</button>
    </div>
  </div>
</template>

<style scoped lang="less">
.container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .btns {
    margin-top: 10px;
    button {
      margin: 0 10px;
    }
  }
}
</style>
