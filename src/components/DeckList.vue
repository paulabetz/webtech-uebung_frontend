<template>
  <div>
    <h2>Meine Karten:</h2>
    <ul>
      <li v-for="cards in decks" :key="card.id">
        <strong>{{ card.question }}</strong>
        - {{card.answer}}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const decks = ref<any[]>([])

onMounted(async () => {
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL
  const response = await fetch(`${baseUrl}/cards`)
  decks.value = await response.json()
})

</script>
