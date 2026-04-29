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
const decks = [
  { id: 1, name: "Web-Tech Grundlagen", cards: [{}, {}] },
  { id: 2, name: "Java Basics",         cards: [{}] },
  { id: 3, name: "Datenbanken",         cards: [{}, {}, {}] },
]
</script>
