import type {
    CommentsListResponse,
    CreateCommentResponse,
    PublicCommentListed,
    VoteCommentResponse
} from '@randomstack/commons'

type CommentWithVotes = {
    id: string
    content: string
    createdAt: Date
    user: {
        id: string
        profile: {displayName: string; photoId: string | null} | null
    }
    votes: {type: 'LIKE' | 'DISLIKE'; userId: string}[]
}

export default class CommentMapper {

    static buildPublicCommentListed(
        comment: CommentWithVotes,
        viewerUserId?: string | null
    ): PublicCommentListed {
        const likesCount = comment.votes.filter(v => v.type === 'LIKE').length
        const dislikesCount = comment.votes.filter(v => v.type === 'DISLIKE').length
        const mine = viewerUserId
            ? comment.votes.find(v => v.userId === viewerUserId)
            : undefined

        return {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            author: {
                id: comment.user.id,
                displayName: comment.user.profile?.displayName || 'Utilisateur',
                photoId: comment.user.profile?.photoId ?? null
            },
            likesCount,
            dislikesCount,
            myVote: mine?.type ?? null
        }
    }

    static buildCommentsListResponse(
        comments: CommentWithVotes[],
        viewerUserId?: string | null
    ): CommentsListResponse {
        const listed = comments.map(c => this.buildPublicCommentListed(c, viewerUserId))
        return {
            commentsCount: listed.length,
            likesCount: listed.reduce((sum, c) => sum + c.likesCount, 0),
            dislikesCount: listed.reduce((sum, c) => sum + c.dislikesCount, 0),
            comments: listed
        }
    }

    static buildCreateCommentResponse(
        comment: CommentWithVotes,
        viewerUserId?: string | null
    ): CreateCommentResponse {
        return {
            success: true,
            comment: this.buildPublicCommentListed(comment, viewerUserId)
        }
    }

    static buildVoteCommentResponse(
        comment: CommentWithVotes,
        viewerUserId?: string | null
    ): VoteCommentResponse {
        return {
            success: true,
            comment: this.buildPublicCommentListed(comment, viewerUserId)
        }
    }
}
