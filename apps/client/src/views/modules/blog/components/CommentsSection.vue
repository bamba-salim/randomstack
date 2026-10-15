<script setup lang="ts">
import {ref, onMounted, watch, computed} from 'vue'
import {useRouter} from 'vue-router'
import {
  fetchComments,
  createComment,
  voteComment,
  deleteComment,
  getMe,
  fileUrl,
  ApiError
} from '#services'
import type {
  CommentsListResponse,
  PublicCommentListed,
  CommentVoteType,
  SessionUserLite
} from '@randomstack/commons'
import {validateCreateComment} from '@randomstack/commons'
import {toast} from '../../../../lib/toast'

const props = defineProps<{
  postId: string
}>()

const emit = defineEmits<{
  'count-change': [count: number]
}>()

const router = useRouter()
const me = ref<SessionUserLite | null>(null)
const data = ref<CommentsListResponse | null>(null)
const loading = ref(true)
const submitting = ref(false)
const draft = ref('')
const contentError = ref<string | null>(null)
const votingId = ref<string | null>(null)

const isLoggedIn = computed(() => Boolean(me.value))

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

const initials = (name: string) => name.substring(0, 2).toUpperCase()

const canDelete = (comment: PublicCommentListed) => {
  if (!me.value) return false
  return (
    me.value.id === comment.author.id ||
    me.value.role === 'ADMIN' ||
    me.value.role === 'MODERATOR'
  )
}

const load = async () => {
  loading.value = true
  try {
    me.value = await getMe()
    data.value = await fetchComments(props.postId)
    emit('count-change', data.value.commentsCount)
  } catch {
    toast.error('Impossible de charger les commentaires.')
  } finally {
    loading.value = false
  }
}

const replaceComment = (updated: PublicCommentListed) => {
  if (!data.value) return
  const idx = data.value.comments.findIndex(c => c.id === updated.id)
  if (idx === -1) return
  data.value.comments[idx] = updated
}

const handleSubmit = async () => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  if (submitting.value) return
  contentError.value = null

  const local = validateCreateComment({postId: props.postId, content: draft.value})
  if (!local.ok) {
    contentError.value = local.errors?.['content'] || local.error
    return
  }

  submitting.value = true
  try {
    const result = await createComment(local.data.postId, local.data.content)
    if (!data.value) {
      data.value = {
        commentsCount: 1,
        comments: [result.comment]
      }
    } else {
      data.value.comments.unshift(result.comment)
      data.value.commentsCount += 1
    }
    draft.value = ''
    emit('count-change', data.value.commentsCount)
    toast.success('Commentaire publié.')
  } catch (err: any) {
    if (err instanceof ApiError && (err.field === 'content' || err.errors?.['content'])) {
      contentError.value = err.errors?.['content'] || err.message
      return
    }
    toast.error(err?.message || 'Publication impossible.')
  } finally {
    submitting.value = false
  }
}

const handleVote = async (comment: PublicCommentListed, vote: CommentVoteType) => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  if (votingId.value) return
  votingId.value = comment.id
  try {
    const next = comment.myVote === vote ? null : vote
    const result = await voteComment(comment.id, next)
    replaceComment(result.comment)
  } catch (err: any) {
    toast.error(err?.message || 'Vote impossible.')
  } finally {
    votingId.value = null
  }
}

const handleDelete = async (comment: PublicCommentListed) => {
  if (!canDelete(comment)) return
  try {
    await deleteComment(comment.id)
    if (!data.value) return
    data.value.comments = data.value.comments.filter(c => c.id !== comment.id)
    data.value.commentsCount = data.value.comments.length
    emit('count-change', data.value.commentsCount)
    toast.success('Commentaire supprimé.')
  } catch (err: any) {
    toast.error(err?.message || 'Suppression impossible.')
  }
}

onMounted(load)
watch(() => props.postId, load)
</script>

<template>
  <section class="comments-section" aria-labelledby="comments-heading">
    <header class="comments-section__header">
      <h2 id="comments-heading" class="comments-section__title">Commentaires</h2>
      <div v-if="data" class="comments-section__stats">
        <span>{{ data.commentsCount }} commentaire{{ data.commentsCount > 1 ? 's' : '' }}</span>
      </div>
    </header>

    <form class="comments-section__form" @submit.prevent="handleSubmit">
      <label class="comments-section__label" for="comment-draft">Ton avis</label>
      <textarea
          id="comment-draft"
          v-model="draft"
          :class="['comments-section__textarea', {'comments-section__textarea--invalid': contentError}]"
          rows="3"
          maxlength="2000"
          :placeholder="isLoggedIn ? 'Écrire un commentaire…' : 'Connecte-toi pour commenter…'"
          :disabled="!isLoggedIn || submitting"
          @input="contentError = null"
      />
      <p v-if="contentError" class="comments-section__field-error">{{ contentError }}</p>
      <div class="comments-section__form-actions">
        <router-link v-if="!isLoggedIn" to="/login" class="comments-section__login-link">
          Se connecter pour commenter ou voter
        </router-link>
        <button
            v-else
            type="submit"
            class="comments-section__submit"
            :disabled="submitting"
        >
          {{ submitting ? 'Publication…' : 'Publier' }}
        </button>
      </div>
    </form>

    <div v-if="loading" class="comments-section__loading">Chargement des commentaires…</div>

    <ul v-else-if="data?.comments.length" class="comments-section__list">
      <li v-for="comment in data.comments" :key="comment.id" class="comments-section__item">
        <div class="comments-section__avatar">
          <img
              v-if="comment.author.photoId"
              :src="fileUrl(comment.author.photoId)"
              :alt="comment.author.displayName"
              loading="lazy"
          />
          <span v-else>{{ initials(comment.author.displayName) }}</span>
        </div>
        <div class="comments-section__body">
          <div class="comments-section__meta">
            <strong>{{ comment.author.displayName }}</strong>
            <time :datetime="String(comment.createdAt)">{{ formatDate(comment.createdAt) }}</time>
          </div>
          <p class="comments-section__content">{{ comment.content }}</p>
          <div class="comments-section__actions">
            <button
                type="button"
                class="comments-section__vote"
                :class="{ 'is-active': comment.myVote === 'LIKE' }"
                :disabled="Boolean(votingId)"
                :title="isLoggedIn ? 'J’aime' : 'Connecte-toi pour liker'"
                @click="handleVote(comment, 'LIKE')"
            >
              ▲ {{ comment.likesCount }}
            </button>
            <button
                type="button"
                class="comments-section__vote"
                :class="{ 'is-active is-dislike': comment.myVote === 'DISLIKE' }"
                :disabled="Boolean(votingId)"
                :title="isLoggedIn ? 'Je n’aime pas' : 'Connecte-toi pour disliker'"
                @click="handleVote(comment, 'DISLIKE')"
            >
              ▼ {{ comment.dislikesCount }}
            </button>
            <button
                v-if="canDelete(comment)"
                type="button"
                class="comments-section__delete"
                @click="handleDelete(comment)"
            >
              Supprimer
            </button>
          </div>
        </div>
      </li>
    </ul>

    <p v-else class="comments-section__empty">Aucun commentaire pour l’instant. Lance la discussion.</p>
  </section>
</template>
