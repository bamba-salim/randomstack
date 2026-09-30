import PostAction from './post.action'
import PostMapper from './post.mapper'
import PostModel from './post.model'

export default class PostController {
// Cible : GET /api/posts/fetch-posts/tag/:tag 🚀
    static async fetchPostsByTag(req: Request, res: Response): Promise<void> {
        try {
            const {tag} = req.params

            const featuredPost = await PostAction.resolveFeaturedPostByTag(tag)
            const excludeId = featuredPost?.id

            const otherPosts = await PostModel.fetchPublishedPostsByTag(tag, excludeId)

            res.json({
                featured: PostMapper.buildFeaturedPost(featuredPost),
                posts: PostMapper.buildListedPostList(otherPosts)
            })
        } catch (error: any) {
            res.status(500).json({error: 'Erreur lors du chargement des articles par tag.'})
        }
    }
}