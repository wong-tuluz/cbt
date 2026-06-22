import { createApp } from 'vue'
import { router } from './router'
import App from './App.vue'
import './style.css'
import pinia from './stores'

createApp(App).use(router).use(pinia).mount('#app')

const theme = localStorage.getItem('theme')
if (theme) {
  const root = document.documentElement
  Object.entries(JSON.parse(theme)).forEach(([k, v]) => {
    root.style.setProperty(k, v as string)
  })
}

