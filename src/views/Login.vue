<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import Alert from '@/components/ui/Alert.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const credentials = ref({
  nombre_de_usuario: '',
  password: ''
});

const errors = ref({});
const showPassword = ref(false);
const formError = ref(null);

const redirect = route.query.redirect || '/agenda';

function validate() {
  errors.value = {};
  
  if (!credentials.value.nombre_de_usuario.trim()) {
    errors.value.nombre_de_usuario = 'El nombre de usuario es requerido';
  }
  
  if (!credentials.value.password) {
    errors.value.password = 'La contraseña es requerida';
  }
  
  return Object.keys(errors.value).length === 0;
}

async function handleSubmit() {
  formError.value = null;
  
  if (!validate()) return;
  
  const result = await authStore.login(credentials.value);
  
  if (result.success) {
    router.push(redirect);
  } else {
    formError.value = result.message;
  }
}

function onKeyPress(event) {
  if (event.key === 'Enter') {
    handleSubmit();
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push(redirect);
  }
});
</script>

<template>
  <main class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>🔐 Iniciar Sesión</h1>
          <p>Accede a tu agenda de contactos</p>
        </div>
        
        <Alert 
          v-if="formError" 
          type="error" 
          dismissible 
          v-model="formError"
        >
          {{ formError }}
        </Alert>
        
        <form @submit.prevent="handleSubmit" @keypress="onKeyPress" novalidate>
          <Input
            name="nombre_de_usuario"
            label="Nombre de usuario"
            v-model="credentials.nombre_de_usuario"
            :error="errors.nombre_de_usuario"
            :required="true"
            placeholder="ej: juan_perez"
            autocomplete="username"
          />
          
          <div class="form-group">
            <label for="password" class="form-label">
              Contraseña <span class="text-danger">*</span>
            </label>
            <div class="password-input">
              <input
                id="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="credentials.password"
                class="form-input"
                :class="{ error: errors.password }"
                placeholder="••••••••"
                autocomplete="current-password"
                @blur="errors.password = !credentials.password ? 'Requerida' : null"
              />
              <button 
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                aria-label="Mostrar contraseña"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
          </div>
          
          <Button 
            type="submit" 
            :loading="authStore.loading"
            :disabled="authStore.loading"
            full-width
            class="mt-4"
          >
            Ingresar
          </Button>
        </form>
        
        <div class="auth-footer">
          <p>
            ¿No tienes cuenta? 
            <router-link :to="{ name: 'Register' }">Regístrate aquí</router-link>
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7c3aed, #14b8a6);
  padding: 2rem;
}

.auth-container {
  width: 100%;
  max-width: 500px;
}

.auth-card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  padding: 2rem;
  animation: fadeIn 0.5s ease;
}

.auth-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.auth-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #7c3aed;
}

.auth-header p {
  color: #6b7280;
  font-size: 0.95rem;
}

.password-input {
  display: flex;
  align-items: center;
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #7c3aed;
  transition: transform 0.2s ease;
}

.password-toggle:hover {
  transform: scale(1.2);
}

.form-error {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
}

.auth-footer a {
  color: #14b8a6;
  font-weight: 600;
  transition: color 0.3s ease;
}

.auth-footer a:hover {
  color: #7c3aed;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>