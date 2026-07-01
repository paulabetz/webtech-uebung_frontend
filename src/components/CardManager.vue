<template>
  <div>
    <h3>Kartenverwaltung</h3>

    <!-- Deck erstellen -->
    <div class="create-form">
      <input v-model="newDeckName" placeholder="Neues Deck (Name)" />
      <button @click="createDeck">Deck erstellen</button>
    </div>

    <!-- Karte erstellen -->
    <div class="create-form">
      <input v-model="newQuestion" placeholder="Frage" />
      <input v-model="newAnswer" placeholder="Antwort" />
      <select v-model="newCardDeckId">
        <option :value="null">Kein Deck</option>
        <option v-for="deck in decks" :key="deck.id" :value="deck.id">{{ deck.name }}</option>
      </select>
      <button @click="createCard">Karte erstellen</button>
    </div>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <!-- Suchfeld & Aktionen -->
    <div class="search-bar">
      <input v-model="searchTerm" placeholder="Karten durchsuchen..." />
      <button class="reset-btn" @click="emit('reset-all-learned')" :disabled="!cards.some(c => c.learned)">Fortschritt zurücksetzen</button>
    </div>

    <ul>
      <li v-for="card in filteredCards" :key="card.id" :class="{ learned: card.learned }">
        <!-- Anzeigemodus -->
        <template v-if="editingId !== card.id">
          <strong>{{ card.question }}</strong> — {{ card.answer }}
          <span v-if="card.learned" class="learned-label"> ✓ Gelernt</span>
          <span v-if="card.deckId" class="deck-label"> 📂 {{ deckName(card.deckId) }}</span>
          <div class="actions">
            <button @click="emit('toggle-learned', card)">
              {{ card.learned ? 'Als ungelernt markieren' : 'Als gelernt markieren' }}
            </button>
            <button @click="startEdit(card)">Bearbeiten</button>
            <button @click="emit('delete-card', card.id)" class="delete-btn">Löschen</button>
          </div>
        </template>

        <!-- Bearbeitungsmodus -->
        <template v-else>
          <input v-model="editQuestion" placeholder="Frage" />
          <input v-model="editAnswer" placeholder="Antwort" />
          <select v-model="editDeckId">
            <option :value="null">Kein Deck</option>
            <option v-for="deck in decks" :key="deck.id" :value="deck.id">{{ deck.name }}</option>
          </select>
          <div class="actions">
            <button @click="saveEdit(card)">Speichern</button>
            <button @click="editingId = null">Abbrechen</button>
          </div>
        </template>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{ cards: any[]; decks: any[] }>()
const emit = defineEmits<{
  'create-deck': [name: string]
  'create-card': [payload: { question: string; answer: string; deckId: number | null }]
  'toggle-learned': [card: any]
  'delete-card': [id: number]
  'save-edit': [payload: { id: number; question: string; answer: string; learned: boolean; deckId: number | null }]
  'reset-all-learned': []
}>()

const searchTerm = ref('')
const newDeckName = ref('')
const newQuestion = ref('')
const newAnswer = ref('')
const newCardDeckId = ref<number | null>(null)
const errorMessage = ref('')
const editingId = ref<number | null>(null)
const editQuestion = ref('')
const editAnswer = ref('')
const editDeckId = ref<number | null>(null)

const deckName = (deckId: number) => props.decks.find(d => d.id === deckId)?.name ?? ''

const filteredCards = computed(() =>
  props.cards.filter(c =>
    c.question.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    c.answer.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
)

const createDeck = () => {
  if (!newDeckName.value.trim()) return
  emit('create-deck', newDeckName.value)
  newDeckName.value = ''
}

const createCard = () => {
  errorMessage.value = ''
  if (!newQuestion.value.trim() || !newAnswer.value.trim()) {
    errorMessage.value = 'Frage und Antwort dürfen nicht leer sein.'
    return
  }
  emit('create-card', { question: newQuestion.value, answer: newAnswer.value, deckId: newCardDeckId.value })
  newQuestion.value = ''
  newAnswer.value = ''
  newCardDeckId.value = null
}

const startEdit = (card: any) => {
  editingId.value = card.id
  editQuestion.value = card.question
  editAnswer.value = card.answer
  editDeckId.value = card.deckId ?? null
}

const saveEdit = (card: any) => {
  emit('save-edit', {
    id: card.id,
    question: editQuestion.value,
    answer: editAnswer.value,
    learned: card.learned,
    deckId: editDeckId.value
  })
  editingId.value = null
}
</script>

<style scoped>
h3 {
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.deck-label {
  color: #555;
  font-size: 0.85rem;
  margin-left: 0.5rem;
}

.error {
  color: #c62828;
  background-color: #ffcdd2;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.reset-btn {
  background-color: #ef9a9a;
  color: #7f0000;
}

.reset-btn:hover:not(:disabled) {
  background-color: #e57373;
}
</style>
