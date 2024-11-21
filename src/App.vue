<script>
import { mapState } from '@/pinia'
import { useCounterStore } from '@/store/counterStore'
import { mapActions } from './pinia/mapHelpers'
export default {
  computed: {
    // array
    ...mapState(useCounterStore, ['count', 'doubleCount']),
    // object
    ...mapState(useCounterStore, {
      f: 'fruits' // fruits 为要取的值，f为重命名
    })
  },

  mounted() {
    console.log(this.f)
  },

  methods: {
    ...mapActions(useCounterStore, ['increase'])
  }
}
</script>

<template>
  <div class="container">
    <h1>hello vue</h1>
    <div>
      <span>计数：</span>
      <span>{{ count }}</span>
    </div>
    <div>
      <span>双倍：</span>
      <span>{{ doubleCount }}</span>
    </div>
    <div>
      <span>水果：</span>
      <span v-for="(fruit, idx) in f" :key="idx"
        >{{ fruit }}{{ idx < f.length - 1 ? '、' : '' }}</span
      >
    </div>
    <div class="btns">
      <button @click="increase(count)">增加</button>
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
