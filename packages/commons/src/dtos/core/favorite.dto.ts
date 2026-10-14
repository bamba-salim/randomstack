import type {PublicPostListed} from './blog.dto'

export interface FavoriteStatusResponse {
    isFavorite: boolean
}

export interface ToggleFavoriteResponse {
    success: true
    isFavorite: boolean
}

export interface FavoritesListResponse {
    favorites: PublicPostListed[]
}
