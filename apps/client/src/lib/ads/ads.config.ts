/**
 * Pubs maison / sponsors.
 * Remplis un placement pour l’afficher. `null` = slot vide (placeholder en DEV seulement).
 * Images : URL absolue ou chemin public (ex. /ads/sponsor.png).
 */
export type AdPlacement =
    | 'home-sidebar'
    | 'encyclopedia-banner'
    | 'article-header'
    | 'article-footer'
    | 'article-rail-left'
    | 'article-rail-right'
    | 'technology-sidebar'
    | 'tag-inline'
    | 'profile-header'
    | 'profile-rail-left'
    | 'profile-rail-right'
    | 'profile-footer'

export interface HouseAd {
    href: string
    imageUrl: string
    title: string
    sponsor?: string
}

export const HOUSE_ADS: Record<AdPlacement, HouseAd | null> = {
    'home-sidebar': null,
    'encyclopedia-banner': null,
    'article-header': null,
    'article-footer': null,
    'article-rail-left': null,
    'article-rail-right': null,
    'technology-sidebar': null,
    'tag-inline': null,
    'profile-header': null,
    'profile-rail-left': null,
    'profile-rail-right': null,
    'profile-footer': null
}

export function getHouseAd(placement: AdPlacement): HouseAd | null {
    return HOUSE_ADS[placement] ?? null
}
