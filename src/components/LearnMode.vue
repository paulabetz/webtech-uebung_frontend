<template>
  <div class="learn-mode">

    <!-- Zusammenfassung am Ende -->
    <div v-if="finished" class="summary">
      <h3>Lernsession beendet!</h3>
      <p>{{ learnedCount }} von {{ cards.length }} Karten als gelernt markiert.</p>
      <button @click="$emit('close')">Zurück zur Übersicht</button>
    </div>

    <!-- Lernkarte -->
    <div v-else class="card-box">
      <p class="progress">Karte {{ currentIndex + 1 }} / {{ cards.length }}</p>

      <div class="card" @click="showAnswer = true">
        <p class="question">{{ currentCard.question }}</p>
        <p v-if="showAnswer" class="answer">{{ currentCard.answer }}</p>
        <p v-else class="hint">Klicken zum Aufdecken</p>
      </div>

      <div v-if="showAnswer" class="actions">
        <button class="learned-btn" @click="markAndNext(true)">Als gelernt markieren</button>
        <button @click="markAndNext(false)">Weiter</button>
      </div>

      <button class="close-btn" @click="$emit('close')">Abbrechen</button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{ cards: any[] }>()
const emit = defineEmits(['close', 'learned'])

const currentIndex = ref(0)
const showAnswer = ref(false)
const learnedCount = ref(0)
const finished = ref(false)

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

const currentCard = computed(() => props.cards[currentIndex.value])

const markAndNext = async (markLearned: boolean) => {
  if (markLearned) {
    await fetch(`${baseUrl}/cards/${currentCard.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: currentCard.value.question,
        answer: currentCard.value.answer,
        learned: true
      })
    })
    learnedCount.value++
    emit('learned')
  }

  if (currentIndex.value + 1 >= props.cards.length) {
    finished.value = true
  } else {
    currentIndex.value++
    showAnswer.value = false
  }
}
</script>

<style scoped>
.learn-mode {
  max-width: 500px;
  margin: 0 auto;
}

.progress {
  color: #444;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.card {
  border: 2px solid #90caf9;
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  background: #e3f2fd;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question {
  font-size: 1.2rem;
  font-weight: bold;
  color: #1a1a1a;
}

.answer {
  font-size: 1.1rem;
  color: #0d47a1;
  font-weight: 500;
}

.hint {
  color: #555;
  font-style: italic;
}

.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  justify-content: center;
}

button {
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #e0e0e0;
  color: #1a1a1a;
}

button:hover {
  background-color: #bdbdbd;
}

.learned-btn {
  background-color: #66bb6a;
  color: white;
}

.learned-btn:hover {
  background-color: #43a047;
}

.close-btn {
  display: block;
  margin: 1rem auto 0;
  background: none;
  color: #444;
  text-decoration: underline;
}

.summary {
  text-align: center;
  padding: 2rem;
  border: 2px solid #66bb6a;
  border-radius: 10px;
  background: #e8f5e9;
  color: #1a1a1a;
}

.summary button {
  margin-top: 1rem;
  background-color: #66bb6a;
  color: white;
}

.summary button:hover {
  background-color: #43a047;
}
</style>
