import { defineStore } from 'pinia';
import { ref } from 'vue';
import { contactService } from '@/services/contactService';
import { useAuthStore } from './auth';
import { handleApiError, getImageUrl } from '@/utils/helpers';

export const useContactsStore = defineStore('contacts', () => {
  const contacts = ref([]);
  const currentContact = ref(null);
  const loading = ref(false);
  const error = ref(null);

  async function fetchContacts() {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await contactService.list(authStore.token);
      const data = response.data || response;
      
      if (data.success && Array.isArray(data.data)) {
        contacts.value = data.data.map(contact => ({
          ...contact,
          fotoUrl: contact.foto ? getImageUrl(contact.foto, 'contactos') : null
        }));
        return contacts.value;
      }
      
      error.value = data.message || 'Error al cargar contactos';
      return [];
      
    } catch (err) {
      error.value = handleApiError(err, 'Error al obtener contactos');
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchContact(id) {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await contactService.get(authStore.token, id);
      const data = response.data || response;
      
      if (data.success && data.data) {
        currentContact.value = {
          ...data.data,
          fotoUrl: data.data.foto 
            ? getImageUrl(data.data.foto, 'contactos') 
            : null
        };
        return currentContact.value;
      }
      
      error.value = data.message || 'Contacto no encontrado';
      return null;
      
    } catch (err) {
      error.value = handleApiError(err, 'Error al cargar contacto');
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function createContact(contactData) {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) return { success: false };
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await contactService.create(authStore.token, contactData);
      const data = response.data || response;
      
      if (data.success) {
        await fetchContacts();
        return { success: true, message: data.message, id: data.id };
      }
      
      error.value = data.message || 'Error al crear contacto';
      return { success: false, message: error.value };
      
    } catch (err) {
      error.value = handleApiError(err, 'Error al crear contacto');
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function updateContact(contactData) {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) return { success: false };
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await contactService.update(authStore.token, contactData);
      const data = response.data || response;
      
      if (data.success) {
        const index = contacts.value.findIndex(c => c.id === contactData.id);
        if (index !== -1) {
          contacts.value[index] = {
            ...contacts.value[index],
            ...contactData,
            fotoUrl: contactData.foto 
              ? getImageUrl(contactData.foto, 'contactos') 
              : contacts.value[index].fotoUrl
          };
        }
        if (currentContact.value?.id === contactData.id) {
          currentContact.value = contacts.value[index];
        }
        return { success: true, message: data.message };
      }
      
      error.value = data.message || 'Error al actualizar contacto';
      return { success: false, message: error.value };
      
    } catch (err) {
      error.value = handleApiError(err, 'Error al actualizar contacto');
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function deleteContact(id) {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) return { success: false };
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await contactService.delete(authStore.token, id);
      const data = response.data || response;
      
      if (data.success) {
        contacts.value = contacts.value.filter(c => c.id !== id);
        if (currentContact.value?.id === id) {
          currentContact.value = null;
        }
        return { success: true, message: data.message };
      }
      
      error.value = data.message || 'Error al eliminar contacto';
      return { success: false, message: error.value };
      
    } catch (err) {
      error.value = handleApiError(err, 'Error al eliminar contacto');
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function uploadContactImage(file) {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) return null;
    
    try {
      const response = await contactService.uploadImage(authStore.token, file);
      const data = response.data || response;
      
      if (data.success && data.filename) {
        return {
          filename: data.filename,
          url: getImageUrl(data.filename, 'contactos')
        };
      }
      
      error.value = data.message || 'Error al subir imagen';
      return null;
      
    } catch (err) {
      error.value = handleApiError(err, 'Error en la subida de imagen');
      return null;
    }
  }

  function clearCurrentContact() {
    currentContact.value = null;
  }

  function clearError() {
    error.value = null;
  }

  function searchContacts(query) {
    if (!query) return contacts.value;
    
    const q = query.toLowerCase().trim();
    return contacts.value.filter(c => 
      c.nombre.toLowerCase().includes(q) ||
      c.apellido?.toLowerCase().includes(q) ||
      c.telefono.includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  }

  return {
    contacts,
    currentContact,
    loading,
    error,
    fetchContacts,
    fetchContact,
    createContact,
    updateContact,
    deleteContact,
    uploadContactImage,
    clearCurrentContact,
    clearError,
    searchContacts
  };
});