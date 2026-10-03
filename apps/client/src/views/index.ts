import {createRouter, createWebHistory} from 'vue-router'

import AppLayout from './layout/@AppLayout.vue'

import HomeView from './modules/commons/HomeView.vue'

import GeneratorView from './modules/stack/GeneratorView.vue'

import EncyclopediaView from './modules/stack/EncyclopediaView.vue'
import TechnologyDetailView from './modules/stack/TechnologyDetailView.vue'

import ArticleDetailView from './modules/blog/ArticleDetailView.vue'
import TagPostsView from './modules/blog/TagPostsView.vue'


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
export default router