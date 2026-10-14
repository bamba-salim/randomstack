import {createRouter, createWebHistory} from 'vue-router'

import {getMe} from '#services'

import AdminLayout from './layout/AdminLayout.vue'

import Login from './core/LoginPage.vue'
import Dashboard from './core/DashboardPage.vue'
import TechnologyForm from './core/EditTechnologyPage.vue'
import PostForm from './core/EditPostPage.vue'
import ManagePost from './core/ManagePost.vue'
import ManageUser from './core/ManageUser.vue'
import EditUserPage from './core/EditUserPage.vue'
import CreateUserPage from './core/CreateUserPage.vue'

const homeForRole = (role?: string) =>
    role === 'ADMIN' || role === 'EDITOR' ? '/dashboard' : '/manage-post'

const hasRole = (userRole: string | undefined, allowed: string[]) =>
    Boolean(userRole && allowed.includes(userRole))

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
            path: '/',
            component: AdminLayout,
            meta: {requiresAuth: true},
            children: [
                {
                    path: 'dashboard',
                    name: 'dashboard',
                    component: Dashboard,
                    meta: {requiresRoles: ['ADMIN', 'EDITOR']}
                },
                {
                    path: 'edit-technology/:id?',
                    name: 'technology-form',
                    component: TechnologyForm,
                    meta: {requiresRoles: ['ADMIN', 'EDITOR']}
                },
                {
                    path: 'manage-post',
                    name: 'manage-post',
                    component: ManagePost,
                    meta: {requiresRoles: ['ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR']}
                },
                {
                    path: 'edit-post/:id?',
                    name: 'post-form',
                    component: PostForm,
                    meta: {requiresRoles: ['ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR']}
                },
                {
                    path: 'manage-user',
                    name: 'manage-user',
                    component: ManageUser,
                    meta: {requiresRoles: ['ADMIN', 'MODERATOR', 'EDITOR']}
                },
                {
                    path: 'create-user',
                    name: 'create-user',
                    component: CreateUserPage,
                    meta: {requiresRoles: ['ADMIN']}
                },
                {
                    path: 'edit-user/:id',
                    name: 'user-detail',
                    component: EditUserPage,
                    meta: {requiresRoles: ['ADMIN', 'MODERATOR', 'EDITOR']}
                }
            ]
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/manage-post'
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
        next(homeForRole(user?.role))
        return
    }

    if (to.path === '/' && user) {
        next(homeForRole(user.role))
        return
    }

    next()
})

export default router
