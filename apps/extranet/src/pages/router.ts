import {createRouter, createWebHistory} from 'vue-router'
import {Login, Dashboard} from './index.ts'
import {AuthService} from '#services'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: Login,
            meta: {guestOnly: true}
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: Dashboard,
            meta: {requiresAuth: true}
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/dashboard'
        }
    ]
})

// Garde-barrière de sécurité global 🚀
router.beforeEach(async (to, _from, next) => {
    let user = null
    try {
        user = await AuthService.getMe()
    } catch {
        user = null
    }

    if (to.meta['requiresAuth'] && !user) {
        next('/login')
    } else if (to.meta['guestOnly'] && user) {
        next('/dashboard')
    } else {
        next()
    }
})

export default router