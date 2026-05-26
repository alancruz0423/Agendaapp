<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useContactsStore } from '@/stores/contacts';
import ContactCard from '@/components/ContactCard.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Alert from '@/components/ui/Alert.vue';

const router = useRouter();
const authStore = useAuthStore();
const contactsStore = useContactsStore();

const searchQuery = ref('');
const alert = ref({ show: false, message: '', type: 'success' });

const filteredContacts = computed(() => {
  if (!searchQuery.value.trim()) return contactsStore.contacts;
  
  const query = searchQuery.value.toLowerCase();
  return contactsStore.contacts.filter(c => 
    c.nombre.toLowerCase().includes(query) ||
    c.apellido?.toLowerCase().includes(query) ||
    c.telefono.includes(query) ||
    c.email?.toLowerCase().includes(query)
  );
});

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'Login', query: { redirect: '/agenda' } });
    return;
  }
  
  await contactsStore.fetchContacts();
});

async function handleDeleteContact(id) {
  const result = await contactsStore.deleteContact(id);
  
  alert.value = {
    show: true,
    message: result.message,
    type: result.success ? 'success' : 'error'
  };
  
  setTimeout(() => {
    alert.value.show = false;
  }, 3000);
}

function goToCreate() {
  router.push({ name: 'ContactCreate' });
}

function refreshContacts() {
  contactsStore.fetchContacts();
}
</script>

<template>
  <main class="agenda-page">
    <div class="container">
      <!-- Header -->
      <div class="agenda-header">
        <div>
          <h1>📇 Mi Agenda</h1>
          <p class="text-muted">
            {{ contactsStore.contacts.length }} contacto{{ contactsStore.contacts.length !== 1 ? 's' : '' }}
          </p>
        </div>
        
        <Button @click="goToCreate" variant="primary">
          ➕ Nuevo Contacto
        </Button>
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
        v-if="contactsStore.error" 
        type="error"
        dismissible
        @update:modelValue="contactsStore.clearError()"
      >
        {{ contactsStore.error }}
      </Alert>
      
      <div class="search-bar">
        <Input
          name="search"
          label=""
          v-model="searchQuery"
          placeholder="🔍 Buscar por nombre, teléfono o email..."
          type="search"
        />
        <button 
          v-if="searchQuery" 
          class="search-clear"
          @click="searchQuery = ''"
        >
          ✕
        </button>
      </div>
      
      <div v-if="contactsStore.loading && !contactsStore.contacts.length" class="loading">
        <div class="spinner"></div>
        <p>Cargando contactos...</p>
      </div>
      
      <div v-else-if="!contactsStore.loading && !filteredContacts.length" class="empty-state">
        <div class="empty-state-icon">📭</div>
        <h3>
          {{ searchQuery ? 'No se encontraron resultados' : 'Tu agenda está vacía' }}
        </h3>
        <p v-if="!searchQuery">
          Comienza agregando tu primer contacto
        </p>
        <Button @click="goToCreate" variant="outline" class="mt-4">
          Agregar contacto
        </Button>
      </div>
      
      <div v-else class="contacts-grid">
        <ContactCard
          v-for="contact in filteredContacts"
          :key="contact.id"
          :contact="contact"
          @delete="handleDeleteContact"
        />
      </div>
      
      <div v-if="contactsStore.contacts.length" class="agenda-footer">
        <Button @click="refreshContacts" variant="outline" size="sm">
          🔄 Actualizar
        </Button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.agenda-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #7c3aed, #14b8a6);
  padding: 2rem;
}

.contacts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.contact-card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: fadeIn 0.5s ease;
}

.contact-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
}

.contact-body {
  padding: 1rem;
}

.contact-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
}

.contact-phone {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.contact-actions {
  display: flex;
  gap: 0.5rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 0.75rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>