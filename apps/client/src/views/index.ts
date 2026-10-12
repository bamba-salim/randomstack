import {createRouter, createWebHistory} from 'vue-router'

import {getMe} from '#services'

import AppLayout from './layout/@AppLayout.vue'

import HomeView from './modules/commons/HomeView.vue'
import LoginView from './modules/commons/LoginView.vue'
import RegisterView from './modules/commons/RegisterView.vue'
import ProfileView from './modules/commons/ProfileView.vue'

import GeneratorView from './modules/stack/GeneratorView.vue'

import EncyclopediaView from './modules/stack/EncyclopediaView.vue'
import TechnologyDetailView from './modules/stack/TechnologyDetailView.vue'

import ArticleDetailView from './modules/blog/ArticleDetailView.vue'
import TagPostsView from './modules/blog/TagPostsView.vue'


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/draft/:shareCode?',
            name: 'Generator',
            component: GeneratorView
        },
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '',
                    name: 'home',
                    component: HomeView
                },
                {
                    path: 'login',
                    name: 'login',
                    component: LoginView,
                    meta: {guestOnly: true}
                },
                {
                    path: 'register',
                    name: 'register',
                    component: RegisterView,
                    meta: {guestOnly: true}
                },
                {
                    path: 'profile',
                    name: 'profile',
                    component: ProfileView,
                    meta: {requiresAuth: true}
                },
                {
                    path: 'encyclopedia',
                    name: 'encyclopedia',
                    component: EncyclopediaView
                },
                {
                    path: 'technology/:slug',
                    name: 'technology-detail',
                    component: TechnologyDetailView
                },
                {
                    path: ':tag/:slug',
                    name: 'article',
                    component: ArticleDetailView
                },
                {
                    path: ':tag',
                    name: 'tag',
                    component: TagPostsView
                }
            ]
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/'
        }
    ]
})

router.beforeEach(async (to, _from, next) => {
    if (!to.meta['requiresAuth'] && !to.meta['guestOnly']) {
        next()
        return
    }

    const user = await getMe()

    if (to.meta['requiresAuth'] && !user) {
        next({path: '/login', query: {redirect: to.fullPath}})
        return
    }

    if (to.meta['guestOnly'] && user) {
        next('/profile')
        return
    }

    next()
})

export default router
