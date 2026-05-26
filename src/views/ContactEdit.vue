<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useContactsStore } from '@/stores/contacts';
import ContactForm from '@/components/ContactForm.vue';
import Alert from '@/components/ui/Alert.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const contactsStore = useContactsStore();

const alert = ref({ show: false, message: '', type: 'success' });
const initialData = ref(null);
const uploadedImage = ref(null);

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'Login', query: { redirect: `/agenda/${route.params.id}` } });
    return;
  }
  
  const contact = await contactsStore.fetchContact(route.params.id);
  
  if (!contact) {
    alert.value = {
      show: true,
      message: 'Contacto no encontrado',
      type: 'error'
    };
    setTimeout(() => router.push({ name: 'Agenda' }), 2000);
    return;
  }
  
  initialData.value = {
    ...contact,
    fotoUrl: contact.fotoUrl || null
  };
});

watch(() => route.params.id, async (newId) => {
  if (newId) {
    await contactsStore.fetchContact(newId);
  }
});

async function handleSubmit(contactData) {
  const dataToSend = {
    id: parseInt(route.params.id),
    ...contactData,
    ...(uploadedImage.value && { foto: uploadedImage.value.filename })
  };
  
  const result = await contactsStore.updateContact(dataToSend);
  
  alert.value = {
    show: true,
    message: result.message,
    type: result.success ? 'success' : 'error'
  };
  
  if (result.success) {
    setTimeout(() => {
      router.push({ name: 'Agenda' });
    }, 1500);
  }
}

async function handleImageUpload({ file, preview, fieldName }) {
  const result = await contactsStore.uploadContactImage(file);
  
  if (result?.filename) {
    uploadedImage.value = result;
    alert.value = {
      show: true,
      message: 'Imagen actualizada',
      type: 'success'
    };
    setTimeout(() => alert.value.show = false, 2000);
  } else {
    alert.value = {
      show: true,
      message: contactsStore.error || 'Error al actualizar imagen',
      type: 'error'
    };
  }
}

function goBack() {
  router.back();
}

function handleDelete() {
  if (confirm('¿Eliminar este contacto permanentemente?')) {
    contactsStore.deleteContact(route.params.id).then(result => {
      alert.value = {
        show: true,
        message: result.message,
        type: result.success ? 'success' : 'error'
      };
      if (result.success) {
        setTimeout(() => router.push({ name: 'Agenda' }), 1500);
      }
    });
  }
}
</script>

<template>
  <main class="contact-form-page">
    <div class="container">
      <div class="form-header">
        <button @click="goBack" class="btn-back">← Volver</button>
        <h1>✏️ Editar Contacto</h1>
      </div>
      
      <Alert 
        v-if="alert.show" 
        :type="alert.type"
        dismissible
        v-model="alert.show"
      >
        {{ alert.message }}
      </Alert>
      
      <Alert 
        v-if="contactsStore.error && !alert.show" 
        type="error"
        dismissible
        @update:modelValue="contactsStore.clearError()"
      >
        {{ contactsStore.error }}
      </Alert>
      
      <!-- Estado de carga -->
      <div v-if="contactsStore.loading && !initialData" class="loading">
        <div class="spinner"></div>
        <p>Cargando contacto...</p>
      </div>
      
      <!-- Formulario -->
      <div v-else-if="initialData" class="form-card">
        <ContactForm
          :initial-data="initialData"
          :loading="contactsStore.loading"
          submitLabel="Actualizar Contacto"
          @submit="handleSubmit"
          @upload-image="handleImageUpload"
        />
        <div class="form-actions-secondary">
          <button @click="handleDelete" class="btn btn-danger">
            🗑️ Eliminar contacto
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.form-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #7c3aed, #14b8a6);
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.form-card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  animation: fadeIn 0.5s ease;
}

.form-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-header h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #7c3aed;
}

.form-error {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>