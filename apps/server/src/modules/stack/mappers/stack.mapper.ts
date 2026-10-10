import type { Technology } from '@randomstack/commons'

export default class StackMapper {
    /**
     * Formate la réponse d'un lien de partage résolu pour le client
     */
    static buildSharedStackResponse(shared: any, allTechs: Technology[]) {
        const getTech = (id: string) => allTechs.find(t => t.id === id) || null

        return {
            projectType: shared.projectType,
            clientLayer: getTech(shared.frontendId),
            serverLayer: getTech(shared.backendId),
            databaseLayer: getTech(shared.databaseId),
            timestamp: shared.createdAt ? new Date(shared.createdAt).toLocaleTimeString('fr-FR') : ''
        }
    }
}