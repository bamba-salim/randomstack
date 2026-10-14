import type {
    EditProfileFormBean,
    ProfileLinkListed,
    PublicPostListed,
    PublicProfileListed,
    SessionUserLite,
    SessionUserResponse,
    SuccessAck
} from '@randomstack/commons'

type SessionUserSource = {
    id: string
    email: string
    role: SessionUserLite['role']
    profile?: {
        displayName: string
        bio: string | null
        photoId: string | null
        favoritesPublic?: boolean
        links?: Array<{
            id: string
            label: string
            url: string
            sortOrder: number
        }>
    } | null
}

export default class AuthMapper {

    static buildProfileLinkListed(link: {
        id: string
        label: string
        url: string
        sortOrder: number
    }): ProfileLinkListed {
        return {
            id: link.id,
            label: link.label,
            url: link.url,
            sortOrder: link.sortOrder
        }
    }

    static buildSessionUserLite(user: SessionUserSource): SessionUserLite {
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            displayName: user.profile?.displayName ?? null,
            bio: user.profile?.bio ?? null,
            photoId: user.profile?.photoId ?? null,
            favoritesPublic: Boolean(user.profile?.favoritesPublic),
            links: (user.profile?.links || []).map(l => this.buildProfileLinkListed(l))
        }
    }

    static buildSessionUserResponse(user: SessionUserSource): SessionUserResponse {
        return {
            user: this.buildSessionUserLite(user)
        }
    }

    static buildSuccessAck(): SuccessAck {
        return {success: true}
    }

    static buildPublicProfileListed(
        profile: {
            id: string
            displayName: string
            bio: string | null
            photoId: string | null
            favoritesPublic: boolean
            links: Array<{id: string; label: string; url: string; sortOrder: number}>
        },
        favorites: PublicPostListed[] = [],
        posts: PublicPostListed[] = []
    ): PublicProfileListed {
        return {
            id: profile.id,
            displayName: profile.displayName,
            bio: profile.bio,
            photoId: profile.photoId,
            links: profile.links.map(l => this.buildProfileLinkListed(l)),
            favoritesPublic: profile.favoritesPublic,
            favorites: profile.favoritesPublic ? favorites : [],
            posts
        }
    }

    static normalizeEditProfileFormBean(body: Partial<EditProfileFormBean>): EditProfileFormBean {
        const displayName = String(body.displayName || '').trim()
        const bioRaw = body.bio
        const bio = bioRaw == null ? null : String(bioRaw).trim() || null
        const photoId = body.photoId ? String(body.photoId) : null
        const favoritesPublic = Boolean(body.favoritesPublic)

        const rawLinks = Array.isArray(body.links) ? body.links : []
        const links = rawLinks
            .map((link, index) => ({
                label: String(link?.label || '').trim(),
                url: String(link?.url || '').trim(),
                sortOrder: typeof link?.sortOrder === 'number' ? link.sortOrder : index
            }))
            .filter(link => link.label && link.url)

        return {displayName, bio, photoId, favoritesPublic, links}
    }
}
