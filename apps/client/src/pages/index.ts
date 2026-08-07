import { createRouter, createWebHistory } from 'vue-router'

// Imports relatifs directs pour contourner le cycle d'initialisation 🚀
import Home from './core/Home.vue'
import Draft from './core/Draft.vue'
import Encyclopedia from './core/Encyclopedia.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/draft/:shareCode?',
            name: 'draft',
            component: Draft
        },
        {
            path: '/encyclopedia',
            name: 'encyclopedia',
            component: Encyclopedia
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/'
        }
    ]
})

export default router