<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: v => ['success', 'error', 'warning', 'info'].includes(v)
  },
  dismissible: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue']);

const classes = computed(() => `alert alert-${props.type}`);

function dismiss() {
  emit('update:modelValue', false);
}
</script>

<template>
  <Transition name="slide">
    <div v-if="modelValue" :class="classes" role="alert">
      <slot></slot>
      
      <button 
        v-if="dismissible" 
        class="alert-close"
        @click="dismiss"
        aria-label="Cerrar alerta"
      >
        &times;
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.alert {
  position: relative;
  padding: 1rem 2.5rem 1rem 1rem;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  box-shadow: var(--shadow-sm);
  animation: fadeIn 0.4s ease;
}

.alert-success {
  background: #d1fae5;
  color: #065f46;
  border-left: 6px solid var(--color-success);
}

.alert-error {
  background: #fee2e2;
  color: #991b1b;
  border-left: 6px solid var(--color-danger);
}

.alert-warning {
  background: #fef3c7;
  color: #92400e;
  border-left: 6px solid var(--color-warning);
}

.alert-info {
  background: #e0f2fe;
  color: #0369a1;
  border-left: 6px solid var(--color-secondary);
}

.alert-close {
  position: absolute;
  top: 0.5rem;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.alert-close:hover {
  opacity: 1;
  transform: scale(1.1);
}

</style>