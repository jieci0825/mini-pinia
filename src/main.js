import { createApp } from 'vue'
import '@/style.css'
import App from '@/App.vue'

import { createPinia } from '@/pinia'

const pinia = createPinia()

// pinia.use(function (store) {
//   console.log('插件:', store)
// })

const app = createApp(App)
app.use(pinia)
app.mount('#app')
