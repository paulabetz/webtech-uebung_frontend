<template>
  <div>
    <div v-if="learnMode">
      <LearnMode :cards="filteredCards" @close="learnMode = false; loadCards()" @learned="loadCards()" />
    </div>

    <div v-else>
    <h2>Meine Karten:</h2>

    <!-- Karte erstellen -->
    <div class="create-form">
      <input v-model="newQuestion" placeholder="Frage" />
      <input v-model="newAnswer" placeholder="Antwort" />
      <button @click="createCard">Karte erstellen</button>
    </div>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <!-- Suchfeld & Filter & Aktionen -->
    <div class="search-bar">
      <input v-model="searchTerm" placeholder="Karten durchsuchen..." />
      <button :class="['filter-btn', { active: showOnlyUnlearned }]" @click="showOnlyUnlearned = !showOnlyUnlearned">
        {{ showOnlyUnlearned ? 'Alle anzeigen' : 'Nur ungelernte' }}
      </button>
      <button class="learn-btn" @click="learnMode = true" :disabled="cards.length === 0">Lernen starten</button>
      <button class="reset-btn" @click="resetAllLearned" :disabled="!cards.some(c => c.learned)">Fortschritt zurücksetzen</button>
    </div>

    <ul>
      <li v-for="card in filteredCards" :key="card.id" :class="{ learned: card.learned }">
        <!-- Anzeigemodus -->
        <template v-if="editingId !== card.id">
          <strong>{{ card.question }}</strong> — {{ card.answer }}
          <span v-if="card.learned" class="learned-label"> ✓ Gelernt</span>
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
          <div class="actions">
            <button @click="saveEdit(card)">Speichern</button>
            <button @click="editingId = null">Abbrechen</button>
          </div>
        </template>
      </li>
    </ul>
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

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

const filteredCards = computed(() =>
  cards.value.filter(c => {
    const matchesSearch =
      c.question.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      c.answer.toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchesFilter = showOnlyUnlearned.value ? !c.learned : true
    return matchesSearch && matchesFilter
  })
)

const loadCards = async () => {
  const response = await fetch(`${baseUrl}/cards`)
  cards.value = await response.json()
}

onMounted(loadCards)

const createCard = async () => {
  errorMessage.value = ''
  if (!newQuestion.value.trim() || !newAnswer.value.trim()) {
    errorMessage.value = 'Frage und Antwort dürfen nicht leer sein.'
    return
  }
  await fetch(`${baseUrl}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: newQuestion.value, answer: newAnswer.value, learned: false })
  })
  newQuestion.value = ''
  newAnswer.value = ''
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
    body: JSON.stringify({ question: card.question, answer: card.answer, learned: !card.learned })
  })
  await loadCards()
}

const startEdit = (card: any) => {
  editingId.value = card.id
  editQuestion.value = card.question
  editAnswer.value = card.answer
}

const resetAllLearned = async () => {
  const learnedCards = cards.value.filter(c => c.learned)
  await Promise.all(learnedCards.map(card =>
    fetch(`${baseUrl}/cards/${card.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: card.question, answer: card.answer, learned: false })
    })
  ))
  await loadCards()
}

const saveEdit = async (card: any) => {
  await fetch(`${baseUrl}/cards/${card.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: editQuestion.value, answer: editAnswer.value, learned: card.learned })
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

.create-form, .search-bar {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

input {
  padding: 0.4rem 0.6rem;
  border: 1px solid #bbb;
  border-radius: 4px;
  color: #1a1a1a;
  background: #fff;
}

input:focus {
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
