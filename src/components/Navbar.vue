<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
  router.push({ name: 'Login' });
}
</script>

<template>
  <nav class="navbar">
    <div class="container navbar-content">
      <router-link :to="{ name: 'Home' }" class="nav-logo">
        📇 AgendaApp
      </router-link>
      
      <div class="nav-links">
        <router-link :to="{ name: 'Home' }" class="nav-link">
          Inicio
        </router-link>
        
        <template v-if="authStore.isAuthenticated">
          <router-link :to="{ name: 'Agenda' }" class="nav-link">
            Agenda
          </router-link>
          <router-link :to="{ name: 'Profile' }" class="nav-link">
            Perfil
          </router-link>
          
          <div class="nav-user">
            <span class="nav-username">{{ authStore.user?.nombre_de_usuario || 'Usuario' }}</span>
          </div>
          
          <button @click="handleLogout" class="btn btn-outline btn-sm">
            Salir
          </button>
        </template>
        
        <template v-else>
          <router-link :to="{ name: 'Login' }" class="nav-link">
            Iniciar sesión
          </router-link>
          <router-link :to="{ name: 'Register' }" class="btn btn-primary btn-sm">
            Registrarse
          </router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: linear-gradient(90deg, #7c3aed, #14b8a6);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 1rem 2rem;
  animation: fadeIn 0.5s ease;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.nav-logo:hover {
  opacity: 0.8;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  color: white;
  font-weight: 600;
  transition: color 0.3s ease;
  text-decoration: none;
}

.nav-link:hover {
  color: #facc15; /* Amarillo */
}

.nav-user {
  margin-right: 1rem;
  color: #fff;
  font-weight: 500;
}

.btn-outline {
  border: 2px solid #facc15;
  color: #facc15;
  background: transparent;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background: #facc15;
  color: #111827;
}

.btn-primary {
  background: #facc15;
  color: #111827;
  font-weight: 600;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: #fde047;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>