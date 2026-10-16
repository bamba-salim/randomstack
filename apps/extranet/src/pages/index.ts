import {createRouter, createWebHistory} from 'vue-router'

import {getMe} from '#services'

const homeForRole = (role?: string) =>
    role === 'ADMIN' || role === 'EDITOR' ? '/dashboard' : '/manage-post'

const hasRole = (userRole: string | undefined, allowed: string[]) =>
    Boolean(userRole && allowed.includes(userRole))

const errorPage = () => import('./core/ErrorPage.vue')

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('./core/LoginPage.vue'),
            meta: {guestOnly: true}
        },
        {
            path: '/404',
            name: 'not-found',
            component: errorPage,
            meta: {errorCode: 404}
        },
        {
            path: '/403',
            name: 'forbidden',
            component: errorPage,
            meta: {errorCode: 403}
        },
        {
            path: '/500',
            name: 'server-error',
            component: errorPage,
            meta: {errorCode: 500}
        },
        {
            path: '/',
            component: () => import('./layout/AdminLayout.vue'),
            meta: {requiresAuth: true},
            children: [
                {
                    path: 'dashboard',
                    name: 'dashboard',
                    component: () => import('./core/DashboardPage.vue'),
                    meta: {requiresRoles: ['ADMIN', 'EDITOR']}
                },
                {
                    path: 'edit-technology/:id?',
                    name: 'technology-form',
                    component: () => import('./core/EditTechnologyPage.vue'),
                    meta: {requiresRoles: ['ADMIN', 'EDITOR']}
                },
                {
                    path: 'manage-post',
                    name: 'manage-post',
                    component: () => import('./core/ManagePost.vue'),
                    meta: {requiresRoles: ['ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR']}
                },
                {
                    path: 'edit-post/:id?',
                    name: 'post-form',
                    component: () => import('./core/EditPostPage.vue'),
                    meta: {requiresRoles: ['ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR']}
                },
                {
                    path: 'manage-user',
                    name: 'manage-user',
                    component: () => import('./core/ManageUser.vue'),
                    meta: {requiresRoles: ['ADMIN', 'MODERATOR', 'EDITOR']}
                },
                {
                    path: 'create-user',
                    redirect: '/edit-user'
                },
                {
                    path: 'edit-user/:id?',
                    name: 'user-form',
                    component: () => import('./core/EditUserPage.vue'),
                    meta: {requiresRoles: ['ADMIN', 'MODERATOR', 'EDITOR']}
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
    let user = null
    try {
        user = await getMe(true)
    } catch {
        user = null
    }

    const needsAuth = to.matched.some(r => r.meta['requiresAuth'])
    const requiredRoles = to.matched
        .map(r => r.meta['requiresRoles'] as string[] | undefined)
        .find(roles => Array.isArray(roles) && roles.length > 0)

    if (needsAuth && !user) {
        next('/login')
        return
    }

    if (to.meta['guestOnly'] && user) {
        next(homeForRole(user.role))
        return
    }

    if (requiredRoles && !hasRole(user?.role, requiredRoles)) {
        next({name: 'forbidden'})
        return
    }

    // Création utilisateur : ADMIN uniquement (`/edit-user` sans id)
    if (to.name === 'user-form' && !to.params['id'] && user?.role !== 'ADMIN') {
        next({name: 'forbidden'})
        return
    }

    if (to.path === '/' && user) {
        next(homeForRole(user.role))
        return
    }

    next()
})

export default router
