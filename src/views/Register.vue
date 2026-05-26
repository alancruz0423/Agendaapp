<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import Alert from '@/components/ui/Alert.vue';
import { 
  required, 
  isValidEmail, 
  isValidUsername, 
  isStrongPassword 
} from '@/utils/validators';

const router = useRouter();
const authStore = useAuthStore();

const formData = ref({
  nombre_de_usuario: '',
  password: '',
  password_confirm: '',
  email: ''
});

const errors = ref({});
const touched = ref({});
const formMessage = ref(null);
const messageType = ref('success');
const showPassword = ref(false);
const showConfirmPassword = ref(false);

function validateField(name, value) {
  touched.value[name] = true;
  
  switch(name) {
    case 'nombre_de_usuario':
      return required(value, 'El nombre de usuario') ||
             (value && !isValidUsername(value) 
               ? 'Solo letras, números, guiones y guiones bajos (3-50 caracteres)' 
               : null);
    
    case 'email':
      return value && !isValidEmail(value) ? 'Formato de email inválido' : null;
    
    case 'password':
      if (required(value, 'La contraseña')) return required(value, 'La contraseña');
      if (!isStrongPassword(value)) {
        return 'Mínimo 6 caracteres, con letras y números';
      }
      return null;
    
    case 'password_confirm':
      if (required(value, 'Confirmar contraseña')) return required(value, 'Confirmar contraseña');
      if (value !== formData.value.password) {
        return 'Las contraseñas no coinciden';
      }
      return null;
    
    default:
      return null;
  }
}

function onBlur(field) {
  errors.value[field] = validateField(field, formData.value[field]);
}

function onInput(field) {
  if (touched.value[field]) {
    errors.value[field] = validateField(field, formData.value[field]);
  }
  
  if (field === 'password' && touched.value.password_confirm) {
    errors.value.password_confirm = validateField('password_confirm', formData.value.password_confirm);
  }
}

function validateForm() {
  // Validar todos los campos
  Object.keys(formData.value).forEach(field => {
    touched.value[field] = true;
    errors.value[field] = validateField(field, formData.value[field]);
  });
  
  return Object.values(errors.value).every(e => !e);
}

async function handleSubmit() {
  formMessage.value = null;
  
  if (!validateForm()) {
    const firstError = Object.keys(errors.value).find(k => errors.value[k]);
    document.querySelector(`[name="${firstError}"]`)?.focus();
    return;
  }
  
  const { password_confirm, ...userData } = formData.value;
  
  const result = await authStore.register(userData);
  
  messageType.value = result.success ? 'success' : 'error';
  formMessage.value = result.message;
  
  if (result.success) {
    setTimeout(() => {
      router.push({ name: 'Login', query: { registered: '1' } });
    }, 2000);
  }
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>✨ Crear Cuenta</h1>
          <p>Únete y comienza a organizar tus contactos</p>
        </div>
        
        <Alert 
          v-if="formMessage" 
          :type="messageType"
          dismissible
          v-model="formMessage"
        >
          {{ formMessage }}
        </Alert>
        
        <form @submit.prevent="handleSubmit" novalidate>
          <Input
            name="nombre_de_usuario"
            label="Nombre de usuario *"
            v-model="formData.nombre_de_usuario"
            :error="touched.nombre_de_usuario && errors.nombre_de_usuario"
            :required="true"
            placeholder="juan_perez"
            autocomplete="username"
            @blur="onBlur('nombre_de_usuario')"
            @input="onInput('nombre_de_usuario')"
          />
          
          <Input
            name="email"
            label="Email"
            type="email"
            v-model="formData.email"
            :error="touched.email && errors.email"
            placeholder="juan@ejemplo.com"
            autocomplete="email"
            @blur="onBlur('email')"
            @input="onInput('email')"
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
                v-model="formData.password"
                class="form-input"
                :class="{ error: touched.password && errors.password }"
                placeholder="••••••••"
                autocomplete="new-password"
                @blur="onBlur('password')"
                @input="onInput('password')"
              />
              <button 
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <span v-if="touched.password && errors.password" class="form-error">
              {{ errors.password }}
            </span>
            <small class="text-muted">
              Mínimo 6 caracteres con letras y números
            </small>
          </div>
          
          <div class="form-group">
            <label for="password_confirm" class="form-label">
              Confirmar contraseña <span class="text-danger">*</span>
            </label>
            <div class="password-input">
              <input
                id="password_confirm"
                name="password_confirm"
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model="formData.password_confirm"
                class="form-input"
                :class="{ error: touched.password_confirm && errors.password_confirm }"
                placeholder="••••••••"
                autocomplete="new-password"
                @blur="onBlur('password_confirm')"
                @input="onInput('password_confirm')"
              />
              <button 
                type="button"
                class="password-toggle"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                {{ showConfirmPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <span v-if="touched.password_confirm && errors.password_confirm" class="form-error">
              {{ errors.password_confirm }}
            </span>
          </div>
          
          <Button 
            type="submit" 
            :loading="authStore.loading"
            :disabled="authStore.loading"
            full-width
            class="mt-4"
          >
            Registrarse
          </Button>
        </form>
        
        <div class="auth-footer">
          <p>
            ¿Ya tienes cuenta? 
            <router-link :to="{ name: 'Login' }">Inicia sesión</router-link>
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.auth-page, .auth-container, .auth-card, .auth-header,
.password-input, .password-toggle, .auth-footer {
}

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

/* Animación */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

</style>