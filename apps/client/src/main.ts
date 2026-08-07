import { createApp } from 'vue'
import App from './App.vue'
import './lib/styles/style.scss' // Import de style centralisé
import router from '#pages' // <-- AJOUTÉ ET LIÉ 🚀


const app = createApp(App)
app.use(router) // <-- ENREGISTRÉ 🚀
app.mount('#app')