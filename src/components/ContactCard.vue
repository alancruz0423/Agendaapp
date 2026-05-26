<script setup>
import { defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  contact: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['delete']);
const router = useRouter();

function getFullName() {
  const { nombre, apellido } = props.contact;
  return apellido ? `${nombre} ${apellido}` : nombre;
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function handleEdit() {
  router.push({ name: 'ContactEdit', params: { id: props.contact.id } });
}

async function handleDelete() {
  if (confirm(`¿Eliminar a ${getFullName()}? Esta acción no se puede deshacer.`)) {
    emit('delete', props.contact.id);
  }
}
</script>

<template>
  <article class="contact-card">
    <div class="contact-image-container">
      <img 
        v-if="contact.fotoUrl" 
        :src="contact.fotoUrl" 
        :alt="getFullName()"
        class="contact-image"
        @error="e => e.target.style.display = 'none'"
      >
      <div v-else class="contact-placeholder">
        👤
      </div>
    </div>
    
    <div class="contact-info">
      <h3 class="contact-name">{{ getFullName() }}</h3>
      
      <div class="contact-detail">
        <span class="contact-detail-icon">📱</span>
        <a :href="`tel:${contact.telefono}`">{{ contact.telefono }}</a>
      </div>
      
      <div v-if="contact.email" class="contact-detail">
        <span class="contact-detail-icon">✉️</span>
        <a :href="`mailto:${contact.email}`">{{ contact.email }}</a>
      </div>
      
      <div v-if="contact.direccion" class="contact-detail">
        <span class="contact-detail-icon">📍</span>
        <span>{{ contact.direccion }}</span>
      </div>
      
      <p v-if="contact.notas" class="contact-notes">
        {{ contact.notas }}
      </p>
      
      <small class="text-muted">
        Creado: {{ formatDate(contact.fecha_creacion) }}
      </small>
    </div>
    
    <div class="contact-actions">
      <button class="btn btn-outline btn-sm" @click="handleEdit">
        ✏️ Editar
      </button>
      <button class="btn btn-danger btn-sm" @click="handleDelete">
        🗑️ Eliminar
      </button>
    </div>
  </article>
</template>
<style scoped>
.contact-card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: fadeIn 0.5s ease;
}

.contact-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
}

.contact-image-container {
  text-align: center;
}

.contact-image {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  border-radius: 12px;
  border-bottom: 3px solid #7c3aed;
}

.contact-placeholder {
  width: 100%;
  height: 180px;
  border-radius: 12px;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #7c3aed;
}

.contact-info {
  flex: 1;
}

.contact-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.contact-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.contact-detail-icon {
  font-size: 1.1rem;
}

.contact-notes {
  font-size: 0.9rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.text-muted {
  color: #9ca3af;
  font-size: 0.8rem;
}

.contact-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn {
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline {
  border: 2px solid #7c3aed;
  color: #7c3aed;
  background: transparent;
}

.btn-outline:hover {
  background: #7c3aed;
  color: #fff;
}

.btn-danger {
  border: 2px solid #ef4444;
  color: #ef4444;
  background: transparent;
}

.btn-danger:hover {
  background: #ef4444;
  color: #fff;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>