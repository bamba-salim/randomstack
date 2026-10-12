import {BaseModel} from '#abstracts'
import type {Role} from '@randomstack/commons'


export default class UserModel extends BaseModel {

    private static readonly profileSelect = {
        displayName: true,
        bio: true,
        photoId: true,
        links: {
            orderBy: {sortOrder: 'asc' as const},
            select: {
                id: true,
                label: true,
                url: true,
                sortOrder: true
            }
        }
    }

    static async findByEmail(email: string) {
        return await this.db.user.findUnique({
            where: {email},
            include: {
                profile: {
                    select: this.profileSelect
                }
            }
        })
    }

    static async findById(id: string) {
        return await this.db.user.findUnique({
            where: {id},
            select: {
                id: true,
                email: true,
                role: true,
                profile: {
                    select: this.profileSelect
                }
            }
        })
    }

    static async updateOwnProfile(
        userId: string,
        data: {
            displayName: string
            bio: string | null
            photoId: string | null
            links: Array<{label: string; url: string; sortOrder: number}>
        }
    ) {
        await this.ensureProfile(userId, data.displayName)

        await this.db.$transaction(async (tx) => {
            await tx.userProfile.update({
                where: {id: userId},
                data: {
                    displayName: data.displayName,
                    bio: data.bio,
                    photoId: data.photoId
                }
            })

            await tx.userLink.deleteMany({where: {profileId: userId}})

            if (data.links.length > 0) {
                await tx.userLink.createMany({
                    data: data.links.map(link => ({
                        profileId: userId,
                        label: link.label,
                        url: link.url,
                        sortOrder: link.sortOrder
                    }))
                })
            }
        })

        return await this.findById(userId)
    }

    static async createWithProfile(
        email: string,
        passwordHash: string,
        role: Role,
        displayName?: string
    ) {
        const name = displayName || email.split('@')[0] || 'User'

        return await this.db.user.create({
            data: {
                email,
                passwordHash,
                role,
                profile: {
                    create: {
                        displayName: name,
                        bio: null
                    }
                }
            },
            include: {profile: true}
        })
    }

    static async createAdmin(email: string, passwordHash: string) {
        return await this.createWithProfile(email, passwordHash, 'ADMIN' as Role)
    }

    static async createEditor(email: string, passwordHash: string) {
        return await this.createWithProfile(email, passwordHash, 'EDITOR' as Role, 'Éditeur')
    }

    static async createUser(email: string, passwordHash: string, displayName?: string) {
        return await this.createWithProfile(email, passwordHash, 'USER' as Role, displayName)
    }

    /** Seed : aligne rôle + mot de passe + profil d'un compte de démo */
    static async updateSeedAccount(
        id: string,
        data: {role: Role; passwordHash: string; displayName: string}
    ) {
        await this.ensureProfile(id, data.displayName)
        return await this.db.user.update({
            where: {id},
            data: {
                role: data.role,
                passwordHash: data.passwordHash
            }
        })
    }

    static async count(): Promise<number> {
        return await this.db.user.count()
    }

    static async findProfileById(id: string | null | undefined) {
        if (!id) return null

        return await this.db.userProfile.findUnique({
            where: {id},
            select: {
                id: true,
                displayName: true,
                bio: true,
                photoId: true
            }
        })
    }

    static async ensureProfile(userId: string, displayName: string) {
        const existing = await this.db.userProfile.findUnique({where: {id: userId}})
        if (existing) return existing

        return await this.db.userProfile.create({
            data: {id: userId, displayName, bio: null}
        })
    }

    /** Comptes pouvant être auteurs d'articles (réassignation ADMIN only) */
    static async findEditorialAuthors() {
        return await this.db.user.findMany({
            where: {role: {in: ['ADMIN', 'EDITOR', 'AUTHOR']}},
            select: {
                id: true,
                email: true,
                profile: {select: {displayName: true}}
            },
            orderBy: {email: 'asc'}
        })
    }

    private static readonly adminUserListedSelect = {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
            select: {
                displayName: true,
                photoId: true,
                _count: {select: {links: true}}
            }
        },
        _count: {select: {authoredPosts: true}}
    } as const

    static async fetchAllAdminUsers(roleFilter?: Role | Role[]) {
        const roles = roleFilter
            ? Array.isArray(roleFilter) ? roleFilter : [roleFilter]
            : undefined

        return await this.db.user.findMany({
            where: roles ? {role: {in: roles}} : undefined,
            select: this.adminUserListedSelect,
            orderBy: {createdAt: 'desc'}
        })
    }

    static async fetchAdminUserListedById(id: string) {
        return await this.db.user.findUnique({
            where: {id},
            select: this.adminUserListedSelect
        })
    }

    static async fetchAdminUserById(id: string) {
        return await this.db.user.findUnique({
            where: {id},
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                profile: {
                    select: {
                        displayName: true,
                        bio: true,
                        photoId: true,
                        links: {
                            orderBy: {sortOrder: 'asc'},
                            select: {
                                id: true,
                                label: true,
                                url: true,
                                sortOrder: true
                            }
                        }
                    }
                },
                authoredPosts: {
                    where: {status: {not: 'DELETED'}},
                    orderBy: {updatedAt: 'desc'},
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        tags: true,
                        imageId: true,
                        publishAt: true
                    }
                }
            }
        })
    }

    static async updateRole(id: string, role: Role) {
        return await this.db.user.update({
            where: {id},
            data: {role},
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                profile: {
                    select: {
                        displayName: true,
                        photoId: true,
                        _count: {select: {links: true}}
                    }
                },
                _count: {select: {authoredPosts: true}}
            }
        })
    }

    static async countAdmins(): Promise<number> {
        return await this.db.user.count({where: {role: 'ADMIN'}})
    }

}
