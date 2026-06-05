<template>
  <div>
    <h2>Meine Karten:</h2>

    <div>
      <input v-model="newQuestion" placeholder="Frage" />
      <input v-model="newAnswer" placeholder="Antwort" />
      <button @click="createCard">Karte erstellen</button>
    </div>

    <ul>
      <li v-for="card in decks" :key="card.id">
        <strong>{{ card.question }}</strong>
        - {{card.answer}}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const decks = ref<any[]>([])
const newQuestion = ref('')
const newAnswer = ref('')

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

onMounted(async () => {
  const response = await fetch(`${baseUrl}/cards`)
  decks.value = await response.json()
})

const createCard = async () => {
  await fetch(`${baseUrl}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: newQuestion.value, answer: newAnswer.value, learned: false })
  })

  const response = await fetch(`${baseUrl}/cards`)
  decks.value = await response.json()

  newQuestion.value = ''
  newAnswer.value = ''
}

</script>
