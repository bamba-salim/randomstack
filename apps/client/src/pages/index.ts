import {createRouter, createWebHistory} from 'vue-router'

import {AppLayout} from '#components'

import HomeView from './core/HomeView.vue'
import GeneratorView from './core/GeneratorView.vue'
import EncyclopediaView from './core/EncyclopediaView.vue'
import TechnologyDetailView from './core/TechnologyDetailView.vue'
import ArticleDetailView from './core/ArticleDetailView.vue'
import TagPostsView from './core/TagPostsView.vue'


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
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
                    path: '/',
                    name: 'home',
                    component: HomeView
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
                    name: 'post',
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
export default router