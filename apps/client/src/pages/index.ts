import {createRouter, createWebHistory} from 'vue-router'

// Imports relatifs directs pour contourner le cycle d'initialisation 🚀
import Home from './core/Home.vue'
import Draft from './core/Draft.vue'
import Encyclopedia from './core/Encyclopedia.vue'
import TechnologyDetail from './core/TechnologyDetail.vue'
import {AppLayout} from '#components'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home // 1. LOBBY : Standalone en dehors du Layout global 🚀
        },
        {
            path: '/draft/:shareCode?',
            name: 'draft',
            component: Draft // 2. GÉNÉRATEUR : Standalone en dehors du Layout global 🚀
        },
        {
            path: '/',
            component: AppLayout, // 3. ENCYCLOPÉDIE & PAGES FUTURES : Enveloppées dans le Layout 🚀
            children: [
                {
                    path: 'encyclopedia',
                    name: 'encyclopedia',
                    component: Encyclopedia
                },
                {
                    path: 'technology/:slug',
                    name: 'technology-detail',
                    component: TechnologyDetail
                }
            ]
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/'
        }
    ]
})
export default router