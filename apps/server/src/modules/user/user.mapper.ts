import type {
    AdminUserDetail,
    AdminUserLinkListed,
    AdminUserListed,
    EditorialAuthorLite,
    AdminPostListed,
    CreateUserResponse,
    UpdateUserRoleResponse
} from '@randomstack/commons'

export default class UserMapper {

    static buildEditorialAuthorLite(user: {
        id: string
        email: string
        profile: {displayName: string} | null
    }): EditorialAuthorLite {
        return {
            id: user.id,
            email: user.email,
            displayName: user.profile?.displayName || user.email
        }
    }

    static buildEditorialAuthorLiteList(users: {
        id: string
        email: string
        profile: {displayName: string} | null
    }[]): EditorialAuthorLite[] {
        return users.map(u => this.buildEditorialAuthorLite(u))
    }

    static buildAdminUserListed(user: {
        id: string
        email: string
        role: AdminUserListed['role']
        createdAt: Date
        profile: {
            displayName: string
            photoId: string | null
            _count: {links: number}
        } | null
        _count: {authoredPosts: number}
    }): AdminUserListed {
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            displayName: user.profile?.displayName || user.email,
            photoId: user.profile?.photoId ?? null,
            createdAt: user.createdAt,
            postsCount: user._count.authoredPosts,
            linksCount: user.profile?._count.links ?? 0
        }
    }

    static buildAdminUserListedList(users: Parameters<typeof UserMapper.buildAdminUserListed>[0][]): AdminUserListed[] {
        return users.map(u => this.buildAdminUserListed(u))
    }

    static buildAdminUserLinkListed(link: {
        id: string
        label: string
        url: string
        sortOrder: number
    }): AdminUserLinkListed {
        return {
            id: link.id,
            label: link.label,
            url: link.url,
            sortOrder: link.sortOrder
        }
    }

    static buildAdminUserDetail(user: {
        id: string
        email: string
        role: AdminUserDetail['role']
        createdAt: Date
        updatedAt: Date
        profile: {
            displayName: string
            bio: string | null
            photoId: string | null
            links: {id: string; label: string; url: string; sortOrder: number}[]
        } | null
        authoredPosts: {
            id: string
            title: string
            status: AdminPostListed['status']
            tags: string[]
            imageId: string | null
            publishAt: Date | null
        }[]
    }): AdminUserDetail {
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            displayName: user.profile?.displayName || user.email,
            bio: user.profile?.bio ?? null,
            photoId: user.profile?.photoId ?? null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            links: (user.profile?.links || []).map(l => this.buildAdminUserLinkListed(l)),
            posts: user.authoredPosts.map(p => ({
                id: p.id,
                title: p.title,
                status: p.status,
                tags: p.tags || [],
                imageId: p.imageId,
                publishAt: p.publishAt ? p.publishAt.toISOString() : null
            }))
        }
    }

    static buildUpdateUserRoleResponse(user: Parameters<typeof UserMapper.buildAdminUserListed>[0]): UpdateUserRoleResponse {
        return {
            success: true,
            user: this.buildAdminUserListed(user)
        }
    }

    static buildCreateUserResponse(user: Parameters<typeof UserMapper.buildAdminUserListed>[0]): CreateUserResponse {
        return {
            success: true,
            user: this.buildAdminUserListed(user)
        }
    }
}
