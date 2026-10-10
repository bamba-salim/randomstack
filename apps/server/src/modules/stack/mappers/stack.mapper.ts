import type {
    DrawnStack,
    DrawResponse,
    DrawHistoryResponse,
    DrawTechnologyLite,
    SharedStackListed,
    ShareCreatedListed
} from '@randomstack/commons'
import TechnologyMapper from './technology.mapper'

export default class StackMapper {

    static buildDrawnStack(
        clientLayer: DrawTechnologyLite | null,
        serverLayer: DrawTechnologyLite | null,
        databaseLayer: DrawTechnologyLite | null,
        timestamp?: string
    ): DrawnStack {
        return {
            clientLayer,
            serverLayer,
            databaseLayer,
            timestamp: timestamp ?? new Date().toLocaleTimeString('fr-FR')
        }
    }

    static buildDrawResponse(current: DrawnStack, history: DrawnStack[]): DrawResponse {
        return {current, history}
    }

    static buildDrawHistoryResponse(history: DrawnStack[]): DrawHistoryResponse {
        return {history: Array.isArray(history) ? history : []}
    }

    static buildSharedStackListed(shared: any, allTechs: any[]): SharedStackListed {
        const getTech = (id: string) => {
            const tech = allTechs.find(t => t.id === id)
            return TechnologyMapper.buildDrawTechnologyLite(tech)
        }

        return {
            projectType: shared.projectType,
            clientLayer: getTech(shared.frontendId),
            serverLayer: getTech(shared.backendId),
            databaseLayer: getTech(shared.databaseId),
            timestamp: shared.createdAt ? new Date(shared.createdAt).toLocaleTimeString('fr-FR') : ''
        }
    }

    static buildShareCreatedListed(saved: {shareCode: string; expiresAt: string | Date}): ShareCreatedListed {
        return {
            success: true,
            shareCode: saved.shareCode,
            expiresAt: saved.expiresAt
        }
    }
}
