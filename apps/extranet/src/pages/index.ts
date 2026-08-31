import {createRouter, createWebHistory} from 'vue-router'

import {AuthService} from '#services'

import AdminLayout from './layout/AdminLayout.vue'

import Login from './core/LoginPage.vue'
import Dashboard from './core/DashboardPage.vue'
import TechnologyForm from './core/EditTechnologyPage.vue'
import PostForm from './core/EditPostPage.vue'
import PostList from './core/PostListPage.vue'


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: Login,
            meta: {guestOnly: true}
        },
        // ROUTES D'ADMINISTRATION IMBRIQUÉES DANS LE LAYOUT PARENT 🚀
        {
            path: '/',
            component: AdminLayout, // Le cadre commun de toutes les pages admin
            meta: {requiresAuth: true},
            children: [
                {
                    path: 'dashboard',
                    name: 'dashboard',
                    component: Dashboard
                },
                {
                    path: 'edit-technology/:id?',
                    name: 'technology-form',
                    component: TechnologyForm
                },
                {
                    path: 'posts',
                    name: 'post-list',
                    component: PostList
                },
                {
                    path: 'edit-post/:id?',
                    name: 'post-form',
                    component: PostForm
                }
            ]
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/dashboard'
        }
    ]
})

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