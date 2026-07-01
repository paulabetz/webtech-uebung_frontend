<template>
  <main>
    <h1 class="page-title">📚 CardWise</h1>
    <DeckList />
  </main>
</template>

<script setup lang="ts">
import DeckList from './components/DeckList.vue'
</script>

<style scoped>
.page-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
}
</style>
