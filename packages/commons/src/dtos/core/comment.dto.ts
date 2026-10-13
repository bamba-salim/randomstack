export type CommentVoteType = 'LIKE' | 'DISLIKE'

/** Auteur d'un commentaire (profil public léger) */
export interface CommentAuthorLite {
    id: string
    displayName: string
    photoId: string | null
}

/** Commentaire listé sous un article */
export interface PublicCommentListed {
    id: string
    content: string
    createdAt: string | Date
    author: CommentAuthorLite
    likesCount: number
    dislikesCount: number
    /** Vote de l'utilisateur connecté, sinon null */
    myVote: CommentVoteType | null
}

export interface CommentsListResponse {
    commentsCount: number
    likesCount: number
    dislikesCount: number
    comments: PublicCommentListed[]
}

export interface CreateCommentFormBean {
    postId: string
    content: string
}

export interface VoteCommentFormBean {
    /** LIKE / DISLIKE ; null ou omit pour retirer le vote */
    vote: CommentVoteType | null
}

export interface CreateCommentResponse {
    success: true
    comment: PublicCommentListed
}

export interface VoteCommentResponse {
    success: true
    comment: PublicCommentListed
}
