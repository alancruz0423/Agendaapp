import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/authService';
import { handleApiError } from '@/utils/helpers';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth_token') || null);
  const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'));
  const loading = ref(false);
  const error = ref(null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userPhoto = computed(() => user.value?.foto || null);

  async function login(credentials) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await authService.login(credentials);
      const data = response.data || response;
      
      if (data.success && data.token) {
        token.value = data.token;
        user.value = data.usuario;
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.usuario));
        return { success: true, data };
      }
      
      error.value = data.message || 'Credenciales inválidas';
      return { success: false, message: error.value };
      
    } catch (err) {
      error.value = handleApiError(err, 'Error al iniciar sesión');
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function register(userData) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await authService.register(userData);
      const data = response.data || response;
      
      if (data.success) {
        return { success: true, message: data.message };
      }
      
      error.value = data.message || 'Error en el registro';
      return { success: false, message: error.value };
      
    } catch (err) {
      error.value = handleApiError(err, 'Error al registrar usuario');
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function fetchProfile() {
    if (!token.value) return null;
    
    try {
      const response = await authService.getProfile(token.value);
      const data = response.data || response;
      
      if (data.success && data.usuario) {
        user.value = data.usuario;
        localStorage.setItem('auth_user', JSON.stringify(data.usuario));
        return user.value;
      }
      
      return null;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }

  async function updateProfile(userData) {
    if (!token.value) return { success: false, message: 'No autenticado' };
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await authService.updateProfile(token.value, userData);
      const data = response.data || response;
      
      if (data.success && data.usuario) {
        user.value = { ...user.value, ...data.usuario };
        localStorage.setItem('auth_user', JSON.stringify(user.value));
        return { success: true, data: user.value };
      }
      
      error.value = data.message || 'Error al actualizar perfil';
      return { success: false, message: error.value };
      
    } catch (err) {
      error.value = handleApiError(err, 'Error al actualizar perfil');
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    if (token.value) {
      try {
        await authService.logout(token.value);
      } catch (err) {
        console.warn('Error en logout del backend:', err);
      }
    }
    
    token.value = null;
    user.value = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  function clearError() {
    error.value = null;
  }

  function getAuthHeaders() {
    return token.value 
      ? { 'Authorization': `Bearer ${token.value}` }
      : {};
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    userPhoto,
    login,
    register,
    fetchProfile,
    updateProfile,
    logout,
    clearError,
    getAuthHeaders
  };
});