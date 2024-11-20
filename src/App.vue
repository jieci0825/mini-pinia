<script setup>
import { useCounterStore } from './store/counterStore'

const useCounter = useCounterStore()
console.log(useCounter)

const { increase: inc } = useCounter

const increase = () => {
  // useCounter.count++
  // useCounter.increase()
  inc()
}
const decrease = () => {
  useCounter.count--
}
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
    <div class="btns">
      <button @click="decrease">-1</button>
      <button @click="increase">+1</button>
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
