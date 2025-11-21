import { defineNuxtPlugin } from '#app'
import Toast from 'vue-toastification'
import "vue-toastification/dist/index.css"

export default defineNuxtPlugin((nuxtApp) => {
  const options = {
    position: "top-center",
    timeout: 2000,
    closeOnClick: true,
    pauseOnHover: true,
    transition: "Vue-Toastification__fade",
  }

  nuxtApp.vueApp.use(Toast, options)
})
