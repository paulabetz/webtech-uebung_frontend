<template>
  <div>
    <h2>Meine Decks</h2>
    <ul>
      <li v-for="deck in decks" :key="deck.id">
        <strong>{{ deck.name }}</strong>
        – {{ deck.cards.length }} Karten
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const decks = [
  { id: 1, name: "Web-Tech Grundlagen", cards: [{}, {}] },
  { id: 2, name: "Java Basics",         cards: [{}] },
  { id: 3, name: "Datenbanken",         cards: [{}, {}, {}] },
]

onMounted(async () => {
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL
  const response = await fetch(`${baseUrl}/api/decks`)
  decks.value = await response.json()
})

</script>
