<template>
  <div>
    <h3>Lernen</h3>
    <div class="search-bar">
      <select v-model="selectedDeckId">
        <option :value="null">Alle Decks</option>
        <option v-for="deck in decks" :key="deck.id" :value="deck.id">{{ deck.name }}</option>
      </select>
      <button :class="['filter-btn', { active: showOnlyUnlearned }]" @click="showOnlyUnlearned = !showOnlyUnlearned">
        {{ showOnlyUnlearned ? 'Alle anzeigen' : 'Nur ungelernte' }}
      </button>
      <br />
      <button class="learn-btn" @click="emit('start-learn')" :disabled="cardsCount === 0">🚀 Lernen starten</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ decks: any[]; cardsCount: number }>()
const emit = defineEmits<{ 'start-learn': [] }>()

const selectedDeckId = defineModel<number | null>('selectedDeckId')
const showOnlyUnlearned = defineModel<boolean>('showOnlyUnlearned')
</script>

<style scoped>
h3 {
  margin-bottom: 1rem;
  color: #1a1a1a;
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
</style>
