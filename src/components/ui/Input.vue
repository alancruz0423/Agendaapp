<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'text'
  },
  name: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: null
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'blur']);

const classes = computed(() => [
  'form-input',
  props.error && 'error'
]);

function onUpdate(value) {
  emit('update:modelValue', value);
}

function onBlur(event) {
  emit('blur', event);
}
</script>

<template>
  <div class="form-group">
    <label :for="name" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    
    <input
      :id="name"
      :name="name"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :class="classes"
      :disabled="disabled"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${name}-error` : undefined"
      @input="onUpdate($event.target.value)"
      @blur="onBlur"
    >
    
    <span v-if="error" :id="`${name}-error`" class="form-error" role="alert">
      {{ error }}
    </span>
  </div>
</template>
<style scoped>
.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: var(--transition);
  background: var(--color-surface);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(124,58,237,0.2);
}

.form-input.error {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 4px rgba(239,68,68,0.2);
}

.form-error {
  color: var(--color-danger);
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.text-danger {
  color: var(--color-danger);
}
</style>