<template>
  <div>
    <h2>Meine Decks</h2>
    <ul>
      <li v-for="deck in decks" :key="deck.id">
        <strong>{{ deck.name }}</strong>
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
