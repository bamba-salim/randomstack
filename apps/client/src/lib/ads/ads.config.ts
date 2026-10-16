/**
 * Pubs maison / sponsors.
 * Remplis un placement pour l’afficher. `null` = slot vide (placeholder en DEV seulement).
 * Images : URL absolue ou chemin public (ex. /ads/sponsor.png).
 */
export type AdPlacement =
    | 'home-header'
    | 'home-sidebar'
    | 'home-after-featured'
    | 'home-feed'
    | 'home-footer'
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
    | 'about-header'
    | 'about-footer'
    | 'about-rail-left'
    | 'about-rail-right'

export interface HouseAd {
    href: string
    imageUrl: string
    title: string
    sponsor?: string
}

export const HOUSE_ADS: Record<AdPlacement, HouseAd | null> = {
    'home-header': null,
    'home-sidebar': null,
    'home-after-featured': null,
    'home-feed': null,
    'home-footer': null,
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
    'profile-footer': null,
    'about-header': null,
    'about-footer': null,
    'about-rail-left': null,
    'about-rail-right': null
}

export function getHouseAd(placement: AdPlacement): HouseAd | null {
    return HOUSE_ADS[placement] ?? null
}
