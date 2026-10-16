import {createRouter, createWebHistory} from 'vue-router'

import {getMe} from '#services'

const errorPage = () => import('./modules/commons/ErrorView.vue')

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/draft/:shareCode?',
            name: 'Generator',
            component: () => import('./modules/stack/GeneratorView.vue')
        },
        {
            path: '/',
            component: () => import('./layout/@AppLayout.vue'),
            children: [
                {
                    path: '',
                    name: 'home',
                    component: () => import('./modules/commons/HomeView.vue')
                },
                {
                    path: 'login',
                    name: 'login',
                    component: () => import('./modules/commons/LoginView.vue'),
                    meta: {guestOnly: true}
                },
                {
                    path: 'register',
                    name: 'register',
                    component: () => import('./modules/commons/RegisterView.vue'),
                    meta: {guestOnly: true}
                },
                {
                    path: 'profile',
                    name: 'profile',
                    component: () => import('./modules/commons/ProfileView.vue'),
                    meta: {requiresAuth: true}
                },
                {
                    path: 'u/:id',
                    name: 'public-profile',
                    component: () => import('./modules/commons/PublicProfileView.vue')
                },
                {
                    path: 'about',
                    name: 'about',
                    component: () => import('./modules/commons/AboutView.vue')
                },
                {
                    path: 'encyclopedia',
                    name: 'encyclopedia',
                    component: () => import('./modules/stack/EncyclopediaView.vue')
                },
                {
                    path: 'technology/:slug',
                    name: 'technology-detail',
                    component: () => import('./modules/stack/TechnologyDetailView.vue')
                },
                {
                    /** Permalien `/post/:shareCode` → redirige vers `/:tag/:slug` */
                    path: 'post/:shareCode',
                    name: 'post-share',
                    component: () => import('./modules/blog/PostShareView.vue')
                },
                {
                    /** Preview staff (brouillon / planifié / archivé) */
                    path: 'preview/:shareCode',
                    name: 'article-preview',
                    component: () => import('./modules/blog/ArticlePreviewView.vue')
                },
                {
                    path: '404',
                    name: 'not-found',
                    component: errorPage,
                    meta: {errorCode: 404}
                },
                {
                    path: '403',
                    name: 'forbidden',
                    component: errorPage,
                    meta: {errorCode: 403}
                },
                {
                    path: '500',
                    name: 'server-error',
                    component: errorPage,
                    meta: {errorCode: 500}
                },
                {
                    /** URL canonique de l’article */
                    path: ':tag/:slug',
                    name: 'article',
                    component: () => import('./modules/blog/ArticleDetailView.vue')
                },
                {
                    path: ':tag',
                    name: 'tag',
                    component: () => import('./modules/blog/TagPostsView.vue')
                },
                {
                    path: ':pathMatch(.*)*',
                    name: 'catch-all',
                    component: errorPage,
                    meta: {errorCode: 404}
                }
            ]
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/404'
        }
    ]
})

router.beforeEach(async (to, _from, next) => {
    if (!to.meta['requiresAuth'] && !to.meta['guestOnly']) {
        next()
        return
    }

    const user = await getMe(true)

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
