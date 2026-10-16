import {BaseModel} from '#abstracts'
import type {Category, CompatibilityKind} from '@randomstack/commons'

export type CompatLinkInput = {
    toId: string
    kind: CompatibilityKind
    note?: string | null
}

export default class TechnologyCompatibilityModel extends BaseModel {

    /** Deux technos partagent-elles au moins une catégorie ? */
    static categoriesOverlap(a: Category[], b: Category[]): boolean {
        if (!a?.length || !b?.length) return false
        const setB = new Set(b)
        return a.some(cat => setB.has(cat))
    }

    static async fetchForTechnology(techId: string) {
        return await this.db.technologyCompatibility.findMany({
            where: {
                OR: [{fromId: techId}, {toId: techId}]
            },
            include: {
                from: {select: {id: true, slug: true, name: true, logo: true, categories: true}},
                to: {select: {id: true, slug: true, name: true, logo: true, categories: true}}
            }
        })
    }

    /**
     * Remplace les liens sortants de `fromId` + miroir entrant.
     * Refuse les cibles de même catégorie (chevauchement).
     */
    static async replaceForTechnology(
        fromId: string,
        links: CompatLinkInput[],
        fromCategories: Category[]
    ): Promise<{ok: true} | {ok: false; error: string}> {
        const unique = new Map<string, CompatLinkInput>()
        for (const link of links) {
            if (!link.toId || link.toId === fromId) continue
            unique.set(link.toId, link)
        }

        const targetIds = [...unique.keys()]
        const targets = targetIds.length
            ? await this.db.technology.findMany({
                where: {id: {in: targetIds}},
                select: {id: true, name: true, categories: true}
            })
            : []

        const byId = new Map(targets.map(t => [t.id, t]))
        for (const id of targetIds) {
            const target = byId.get(id)
            if (!target) {
                return {ok: false, error: `Technologie liée introuvable (${id}).`}
            }
            if (this.categoriesOverlap(fromCategories, target.categories as Category[])) {
                return {
                    ok: false,
                    error: `Compatibilité refusée avec « ${target.name} » : même catégorie (liens inter-catégories uniquement).`
                }
            }
        }

        await this.db.$transaction(async (tx) => {
            await tx.technologyCompatibility.deleteMany({
                where: {
                    OR: [{fromId}, {toId: fromId}]
                }
            })

            const rows: {
                fromId: string
                toId: string
                kind: CompatibilityKind
                note: string | null
            }[] = []

            for (const link of unique.values()) {
                const note = link.note?.trim() || null
                rows.push({fromId, toId: link.toId, kind: link.kind, note})
                rows.push({fromId: link.toId, toId: fromId, kind: link.kind, note})
            }

            if (rows.length) {
                await tx.technologyCompatibility.createMany({data: rows})
            }
        })

        return {ok: true}
    }
}
