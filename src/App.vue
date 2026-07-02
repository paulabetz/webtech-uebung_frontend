<template>
  <main>
    <h1 class="page-title">📚 CardWise</h1>

    <p v-if="loading" class="status">Lädt...</p>

    <div v-else-if="!user" class="login-box">
      <p>Melde dich an, um deine eigenen Karten zu erstellen und zu lernen.</p>
      <button class="login-btn" @click="login">Mit GitHub anmelden</button>
    </div>

    <div v-else>
      <div class="user-bar">
        <img v-if="user.avatarUrl" :src="user.avatarUrl" class="avatar" alt="" />
        <span>{{ user.username }}</span>
        <button class="logout-btn" @click="logout">Abmelden</button>
      </div>
      <DeckList />
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DeckList from './components/DeckList.vue'

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

const user = ref<{ id: number; username: string; avatarUrl: string | null } | null>(null)
const loading = ref(true)

const loadUser = async () => {
  const response = await fetch(`${baseUrl}/api/me`, { credentials: 'include' })
  user.value = response.ok ? await response.json() : null
}

onMounted(async () => {
  await loadUser()
  loading.value = false
})

const login = () => {
  window.location.href = `${baseUrl}/oauth2/authorization/github`
}

const logout = async () => {
  await fetch(`${baseUrl}/api/logout`, { method: 'POST', credentials: 'include' })
  user.value = null
}
</script>

<style scoped>
.page-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
}

.status {
  text-align: center;
  color: #555;
}

.login-box {
  text-align: center;
  color: #1a1a1a;
}

.login-box p {
  margin-bottom: 1rem;
}

.login-btn {
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #42a5f5;
  color: white;
  font-size: 0.95rem;
}

.login-btn:hover {
  background-color: #1e88e5;
}

.user-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.logout-btn {
  padding: 0.3rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #e0e0e0;
  color: #1a1a1a;
  font-size: 0.95rem;
}

.logout-btn:hover {
  background-color: #bdbdbd;
}
</style>
