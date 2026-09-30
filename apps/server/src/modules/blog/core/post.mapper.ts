import type {FeaturedPost, ListedPost, Post, AdminPostList} from '@randomstack/commons'

export default class PostMapper {

    static buildFeaturedPost(post: Post): FeaturedPost {
        return {
            id: post.id,
            slug: post.slug,
            title: post.title,
            summary: post.summary,
            mainTag: post.tags[0],
            image: post.imageId,
            publishAt: post.publishAt || post.updatedAt
        }
    }

    static buildListedPost(post: Post): ListedPost {

        return {
            id: post.id,
            slug: post.slug,
            title: post.title,
            mainTag: post.tags[0],
            image: post.imageId,
            publishAt: post.publishAt || post.updatedAt
        }

    }

    static buildListedPostList(posts: Post[]) {
        return posts.map(post => this.buildListedPost(post))
    }

    static buildAdminPost(post: Post): AdminPostList {
        return {
            id: post.id,
            title: post.title,
            status: post.status,
            tags: post.tags,
            imageId: post.imageId,
            publishAt: post.publishAt
        }
    }

    static buildAdminPostList(posts: Post[]) {
        return posts.map(post => this.buildAdminPost(post))
    }

}