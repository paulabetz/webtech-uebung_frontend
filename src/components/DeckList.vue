<template>
  <div>
    <div v-if="learnMode">
      <LearnMode :cards="cards" @close="learnMode = false; loadCards()" @learned="loadCards()" />
    </div>

    <div v-else>
    <h2>Meine Karten:</h2>

    <!-- Karte erstellen -->
    <div class="create-form">
      <input v-model="newQuestion" placeholder="Frage" />
      <input v-model="newAnswer" placeholder="Antwort" />
      <button @click="createCard">Karte erstellen</button>
    </div>

    <!-- Suchfeld & Lernen -->
    <div class="search-bar">
      <input v-model="searchTerm" placeholder="Karten durchsuchen..." />
      <button class="learn-btn" @click="learnMode = true" :disabled="cards.length === 0">Lernen starten</button>
    </div>

    <ul>
      <li v-for="card in filteredCards" :key="card.id" :class="{ learned: card.learned }">
        <!-- Anzeigemodus -->
        <template v-if="editingId !== card.id">
          <strong>{{ card.question }}</strong> — {{ card.answer }}
          <span v-if="card.learned"> ✓ Gelernt</span>
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

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

const filteredCards = computed(() =>
  cards.value.filter(c =>
    c.question.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    c.answer.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
)

const loadCards = async () => {
  const response = await fetch(`${baseUrl}/cards`)
  cards.value = await response.json()
}

onMounted(loadCards)

const createCard = async () => {
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
.create-form, .search-bar {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
}

input {
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}

li.learned {
  background-color: #e8f5e9;
  border-color: #a5d6a7;
}

.actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

button {
  padding: 0.3rem 0.7rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #e0e0e0;
}

button:hover {
  background-color: #bdbdbd;
}

.delete-btn {
  background-color: #ffcdd2;
}

.delete-btn:hover {
  background-color: #ef9a9a;
}

.learn-btn {
  background-color: #90caf9;
}

.learn-btn:hover {
  background-color: #64b5f6;
}
</style>
