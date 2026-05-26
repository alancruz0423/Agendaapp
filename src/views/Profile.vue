<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import ImageUploader from '@/components/ImageUploader.vue';
import Alert from '@/components/ui/Alert.vue';
import { isValidEmail } from '@/utils/validators';

const router = useRouter();
const authStore = useAuthStore();

const formData = ref({
  email: '',
  foto: null
});

const errors = ref({});
const alert = ref({ show: false, message: '', type: 'success' });
const previewUrl = ref(null);

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'Login', query: { redirect: '/perfil' } });
    return;
  }
  
  // Cargar datos del perfil
  if (authStore.user) {
    formData.value.email = authStore.user.email || '';
    previewUrl.value = authStore.user.foto 
      ? `/api/uploads/usuarios/${authStore.user.foto}`
      : null;
  }
});

function validate() {
  errors.value = {};
  
  if (formData.value.email && !isValidEmail(formData.value.email)) {
    errors.value.email = 'Formato de email inválido';
  }
  
  return Object.keys(errors.value).length === 0;
}

async function handleSubmit() {
  if (!validate()) return;
  
  const result = await authStore.updateProfile({
    email: formData.value.email,
    foto: formData.value.foto
  });
  
  alert.value = {
    show: true,
    message: result.message,
    type: result.success ? 'success' : 'error'
  };
  
  if (result.success) {
    previewUrl.value = result.data?.foto 
      ? `/api/uploads/usuarios/${result.data.foto}`
      : null;
  }
}

async function handleImageUpload({ file, preview }) {
  previewUrl.value = preview;
  
}

function formatDate(dateString) {
  if (!dateString) return 'Fecha no disponible';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function goBack() {
  router.back();
}
</script>

<template>
  <main class="profile-page">
    <div class="container">
      <div class="profile-header">
        <button @click="goBack" class="btn-back">← Volver</button>
        <h1>👤 Mi Perfil</h1>
      </div>
      
      <Alert 
        v-if="alert.show" 
        :type="alert.type"
        dismissible
        v-model="alert.show"
      >
        {{ alert.message }}
      </Alert>
      
      <div class="profile-card card">
        <div class="profile-avatar-section">
          <img 
            v-if="previewUrl" 
            :src="previewUrl" 
            alt="Avatar"
            class="profile-avatar"
            @error="e => e.target.style.display = 'none'"
          >
          <div v-else class="profile-avatar profile-avatar-placeholder">
            {{ authStore.user?.nombre_de_usuario?.charAt(0).toUpperCase() }}
          </div>
          
          <ImageUploader
            label="Cambiar foto"
            endpoint="/auth/editar.php?upload=1"
            v-model="formData.foto"
            :preview-url="previewUrl"
            @uploaded="handleImageUpload"
          />
        </div>
        
        <div class="profile-info">
          <h2 class="profile-username">
            {{ authStore.user?.nombre_de_usuario }}
          </h2>
          <p class="profile-registered">
            Miembro desde: {{ formatDate(authStore.user?.fecha_registro) }}
          </p>
        </div>
        
        <form @submit.prevent="handleSubmit" class="profile-form">
          <Input
            name="email"
            label="Email"
            type="email"
            v-model="formData.email"
            :error="errors.email"
            placeholder="tu@email.com"
          />
          
          <div class="profile-actions">
            <Button 
              type="submit" 
              :loading="authStore.loading"
              :disabled="authStore.loading"
            >
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
      
      <div class="security-section card mt-4">
        <h3 class="card-title">🔐 Seguridad</h3>
        <p class="text-muted">
          Para cambiar tu contraseña, contacta al administrador o utiliza 
          la opción de recuperación en la pantalla de login.
        </p>
        
        <Button 
          @click="authStore.logout(); router.push('/')" 
          variant="danger"
          class="mt-2"
        >
          🚪 Cerrar sesión en todos los dispositivos
        </Button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #7c3aed, #14b8a6);
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.container {
  width: 100%;
  max-width: 700px;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  color: #fff;
}

.profile-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
}

.btn-back {
  background: transparent;
  border: none;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn-back:hover {
  transform: translateX(-4px);
}

.profile-card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  padding: 2rem;
  animation: fadeIn 0.5s ease;
}

.profile-avatar-section {
  text-align: center;
  margin-bottom: 1.5rem;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #7c3aed;
  box-shadow: 0 4px 12px rgba(124,58,237,0.3);
  margin-bottom: 1rem;
}

.profile-avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: #7c3aed;
  margin: 0 auto 1rem;
}

.profile-info {
  text-align: center;
  margin-bottom: 1.5rem;
}

.profile-username {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1f2937;
}

.profile-registered {
  color: #6b7280;
  font-size: 0.9rem;
}

.profile-form {
  margin-top: 1rem;
}

.profile-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.security-section {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  padding: 1.5rem;
  animation: fadeIn 0.5s ease;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1f2937;
}

.text-muted {
  color: #6b7280;
  font-size: 0.9rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>