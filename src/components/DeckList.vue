<template>
  <div>
    <div v-if="learnMode">
      <LearnMode :cards="cardsForLearn" @close="learnMode = false; loadCards()" @learned="loadCards()" />
    </div>

    <div v-else>
    <h2>Meine Karten:</h2>

    <nav class="tabs">
      <button :class="['tab-btn', { active: activeTab === 'learn' }]" @click="activeTab = 'learn'">Lernmodus</button>
      <button :class="['tab-btn', { active: activeTab === 'manage' }]" @click="activeTab = 'manage'">Karten verwalten</button>
    </nav>

    <!-- Lernmodus -->
    <div v-if="activeTab === 'learn'">
      <div class="search-bar">
        <select v-model="selectedDeckId">
          <option :value="null">Alle Decks</option>
          <option v-for="deck in decks" :key="deck.id" :value="deck.id">{{ deck.name }}</option>
        </select>
        <button :class="['filter-btn', { active: showOnlyUnlearned }]" @click="showOnlyUnlearned = !showOnlyUnlearned">
          {{ showOnlyUnlearned ? 'Alle anzeigen' : 'Nur ungelernte' }}
        </button>
        <br />
        <button class="learn-btn" @click="learnMode = true" :disabled="cardsForLearn.length === 0">🚀 Lernen starten</button>
      </div>
    </div>

    <!-- Karten verwalten -->
    <div v-else>
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

      <!-- Suchfeld & Filter & Aktionen -->
      <div class="search-bar">
        <input v-model="searchTerm" placeholder="Karten durchsuchen..." />
        <select v-model="selectedDeckId">
          <option :value="null">Alle Decks</option>
          <option v-for="deck in decks" :key="deck.id" :value="deck.id">{{ deck.name }}</option>
        </select>
        <button class="reset-btn" @click="resetAllLearned" :disabled="!cards.some(c => c.learned)">Fortschritt zurücksetzen</button>
      </div>

      <ul>
        <li v-for="card in cardsForManage" :key="card.id" :class="{ learned: card.learned }">
          <!-- Anzeigemodus -->
          <template v-if="editingId !== card.id">
            <strong>{{ card.question }}</strong> — {{ card.answer }}
            <span v-if="card.learned" class="learned-label"> ✓ Gelernt</span>
            <span v-if="card.deckId" class="deck-label"> 📂 {{ deckName(card.deckId) }}</span>
            <div class="actions">
              <button @click="toggleLearned(card)">
                {{ card.learned ? 'Als ungelernt markieren' : 'Als gelernt markieren' }}
              </button>
              <button @click="startEdit(card)">Bearbeiten</button>
              <button @click="deleteCard(card.id)" class="delete-btn">Löschen</button>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import LearnMode from './LearnMode.vue'

const cards = ref<any[]>([])
const newQuestion = ref('')
const newAnswer = ref('')
const searchTerm = ref('')
const editingId = ref<number | null>(null)
const editQuestion = ref('')
const editAnswer = ref('')
const learnMode = ref(false)
const errorMessage = ref('')
const showOnlyUnlearned = ref(false)
const activeTab = ref<'learn' | 'manage'>('learn')

const decks = ref<any[]>([])
const newCardDeckId = ref<number | null>(null)
const newDeckName = ref('')
const selectedDeckId = ref<number | null>(null)
const editDeckId = ref<number | null>(null)

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

const deckName = (deckId: number) => {
  return decks.value.find(d => d.id === deckId)?.name ?? ''
}

// Feste, id-basierte Sortierung: verhindert, dass Karten ihre Reihenfolge
// wechseln, wenn das Backend sie nach einem Update in anderer Reihenfolge liefert.

// Kartenverwaltung: alle Karten, gefiltert per Suche & Deck-Auswahl
const cardsForManage = computed(() =>
  cards.value
    .filter(c => {
      const matchesSearch =
        c.question.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        c.answer.toLowerCase().includes(searchTerm.value.toLowerCase())
      const matchesDeck = selectedDeckId.value !== null ? c.deckId === selectedDeckId.value : true
      return matchesSearch && matchesDeck
    })
    .sort((a, b) => a.id - b.id)
)

// Lernmodus: Karten für die Lernsession, gefiltert per Deck-Auswahl & "Nur ungelernte"
const cardsForLearn = computed(() =>
  cards.value
    .filter(c => {
      const matchesFilter = showOnlyUnlearned.value ? !c.learned : true
      const matchesDeck = selectedDeckId.value !== null ? c.deckId === selectedDeckId.value : true
      return matchesFilter && matchesDeck
    })
    .sort((a, b) => a.id - b.id)
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

const createDeck = async () => {
  if (!newDeckName.value.trim()) return
  await fetch(`${baseUrl}/decks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newDeckName.value })
  })
  newDeckName.value = ''
  await loadDecks()
}

const createCard = async () => {
  errorMessage.value = ''
  if (!newQuestion.value.trim() || !newAnswer.value.trim()) {
    errorMessage.value = 'Frage und Antwort dürfen nicht leer sein.'
    return
  }
  await fetch(`${baseUrl}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: newQuestion.value, answer: newAnswer.value, learned: false, deckId: newCardDeckId.value })
  })
  newQuestion.value = ''
  newAnswer.value = ''
  newCardDeckId.value = null
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

const startEdit = (card: any) => {
  editingId.value = card.id
  editQuestion.value = card.question
  editAnswer.value = card.answer
  editDeckId.value = card.deckId ?? null
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

const saveEdit = async (card: any) => {
  await fetch(`${baseUrl}/cards/${card.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: editQuestion.value, answer: editAnswer.value, learned: card.learned, deckId: editDeckId.value })
  })
  editingId.value = null
  await loadCards()
}
</script>

<style scoped>
h2 {
  margin-bottom: 1rem;
  color: #1a1a1a;
}

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

.tab-btn:hover {
  background-color: #f0f0f0;
}

.tab-btn.active {
  color: #1e88e5;
  border-bottom: 2px solid #1e88e5;
  margin-bottom: -2px;
}

.create-form, .search-bar {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

input, select {
  padding: 0.4rem 0.6rem;
  border: 1px solid #bbb;
  border-radius: 4px;
  color: #1a1a1a;
  background: #fff;
}

input:focus, select:focus {
  outline: 2px solid #90caf9;
  border-color: #90caf9;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 0.75rem 1rem;
  margin-bottom: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  color: #1a1a1a;
}

li.learned {
  background-color: #e8f5e9;
  border-color: #81c784;
}

.learned-label {
  color: #2e7d32;
  font-weight: 600;
}

.deck-label {
  color: #555;
  font-size: 0.85rem;
  margin-left: 0.5rem;
}

.actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

button {
  padding: 0.3rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #e0e0e0;
  color: #1a1a1a;
}

button:hover {
  background-color: #bdbdbd;
}

.delete-btn {
  background-color: #ef9a9a;
  color: #7f0000;
}

.delete-btn:hover {
  background-color: #e57373;
}

.learn-btn {
  background-color: #42a5f5;
  color: white;
  font-size: 1rem;
  padding: 0.5rem 1.2rem;
}

.learn-btn:hover {
  background-color: #1e88e5;
}

.filter-btn {
  background-color: #e0e0e0;
  color: #1a1a1a;
}

.filter-btn.active {
  background-color: #ffd54f;
  color: #4a3800;
}

.filter-btn:hover {
  background-color: #bdbdbd;
}

.reset-btn {
  background-color: #ef9a9a;
  color: #7f0000;
}

.reset-btn:hover:not(:disabled) {
  background-color: #e57373;
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.error {
  color: #c62828;
  background-color: #ffcdd2;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}
</style>
