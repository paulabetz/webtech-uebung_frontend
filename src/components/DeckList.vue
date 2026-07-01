<template>
  <div v-if="learnMode">
    <LearnMode :cards="cardsForLearn" @close="learnMode = false; loadCards()" @learned="loadCards()" />
  </div>

  <div v-else>
    <nav class="tabs">
      <button :class="['tab-btn', { active: activeTab === 'learn' }]" @click="activeTab = 'learn'">Lernen</button>
      <button :class="['tab-btn', { active: activeTab === 'manage' }]" @click="activeTab = 'manage'">Kartenverwaltung</button>
    </nav>

    <LearnTab
      v-if="activeTab === 'learn'"
      v-model:selected-deck-id="selectedDeckId"
      v-model:show-only-unlearned="showOnlyUnlearned"
      :decks="decks"
      :cards-count="cardsForLearn.length"
      @start-learn="learnMode = true"
    />

    <CardManager
      v-else
      :cards="cardsInDeck"
      :decks="decks"
      @create-deck="createDeck"
      @create-card="createCard"
      @toggle-learned="toggleLearned"
      @delete-card="deleteCard"
      @save-edit="saveEdit"
      @reset-all-learned="resetAllLearned"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import LearnMode from './LearnMode.vue'
import LearnTab from './LearnTab.vue'
import CardManager from './CardManager.vue'

const cards = ref<any[]>([])
const decks = ref<any[]>([])
const learnMode = ref(false)
const activeTab = ref<'learn' | 'manage'>('learn')

const selectedDeckId = ref<number | null>(null)
const showOnlyUnlearned = ref(false)

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

// Feste, id-basierte Sortierung: verhindert, dass Karten ihre Reihenfolge
// wechseln, wenn das Backend sie nach einem Update in anderer Reihenfolge liefert.
const cardsInDeck = computed(() =>
  cards.value
    .filter(c => selectedDeckId.value !== null ? c.deckId === selectedDeckId.value : true)
    .sort((a, b) => a.id - b.id)
)

const cardsForLearn = computed(() =>
  cardsInDeck.value.filter(c => showOnlyUnlearned.value ? !c.learned : true)
)

const loadCards = async () => {
  const response = await fetch(`${baseUrl}/cards`)
  cards.value = await response.json()
}

const loadDecks = async () => {
  const response = await fetch(`${baseUrl}/decks`)
  decks.value = await response.json()
}

onMounted(async () => {
  await loadCards()
  await loadDecks()
})

const createDeck = async (name: string) => {
  await fetch(`${baseUrl}/decks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  })
  await loadDecks()
}

const createCard = async (payload: { question: string; answer: string; deckId: number | null }) => {
  await fetch(`${baseUrl}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, learned: false })
  })
  await loadCards()
}

const deleteCard = async (id: number) => {
  await fetch(`${baseUrl}/cards/${id}`, { method: 'DELETE' })
  await loadCards()
}

const toggleLearned = async (card: any) => {
  await fetch(`${baseUrl}/cards/${card.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: card.question, answer: card.answer, learned: !card.learned, deckId: card.deckId })
  })
  await loadCards()
}

const saveEdit = async (payload: { id: number; question: string; answer: string; learned: boolean; deckId: number | null }) => {
  await fetch(`${baseUrl}/cards/${payload.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: payload.question, answer: payload.answer, learned: payload.learned, deckId: payload.deckId })
  })
  await loadCards()
}

const resetAllLearned = async () => {
  const learnedCards = cards.value.filter(c => c.learned)
  await Promise.all(learnedCards.map(card =>
    fetch(`${baseUrl}/cards/${card.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: card.question, answer: card.answer, learned: false, deckId: card.deckId })
    })
  ))
  await loadCards()
}
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #ddd;
}

.tab-btn {
  background: none;
  border-radius: 4px 4px 0 0;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  color: #666;
}

.tab-btn.active {
  color: #1e88e5;
  border-bottom: 2px solid #1e88e5;
  margin-bottom: -2px;
}

.tab-btn:hover {
  background-color: #f0f0f0;
}
</style>
