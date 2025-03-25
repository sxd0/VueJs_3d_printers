<script setup lang="ts">
import { ref } from 'vue';
import type { Plastic } from '@/types';

const emit = defineEmits<{
  save: [plastic: Omit<Plastic, 'id'>];
  cancel: [];
}>();

const material = ref('');
const color = ref('');
const length = ref<number>(10);
const errors = ref<Record<string, string>>({});

const availableColors = [
  { value: 'Red', label: 'Красный' },
  { value: 'Blue', label: 'Синий' },
  { value: 'Green', label: 'Зеленый' },
  { value: 'Yellow', label: 'Желтый' },
  { value: 'Black', label: 'Черный' }
];

const validate = (): boolean => {
  errors.value = {};
  
  if (!material.value.trim()) {
    errors.value.material = 'Материал пластика обязателен';
  }
  
  if (!color.value) {
    errors.value.color = 'Выберите цвет пластика';
  }
  
  if (!length.value || length.value <= 0) {
    errors.value.length = 'Длина нити должна быть положительным числом';
  }
  
  return Object.keys(errors.value).length === 0;
};

const handleSubmit = () => {
  if (!validate()) return;
  
  const newPlastic: Omit<Plastic, 'id'> = {
    material: material.value,
    color: color.value,
    length: length.value,
    isInstalled: false
  };
  
  emit('save', newPlastic);
  resetForm();
};

const resetForm = () => {
  material.value = '';
  color.value = '';
  length.value = 10;
  errors.value = {};
};
</script>

<template>
  <div class="plastic-form">
    <h2>Добавить новый пластик</h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="material">Материал:</label>
        <input 
          id="material"
          v-model="material"
          type="text"
          placeholder="Например, PLA, ABS, PETG"
          :class="{ 'has-error': errors.material }"
        />
        <div v-if="errors.material" class="error-message">{{ errors.material }}</div>
      </div>
      
      <div class="form-group">
        <label for="color">Цвет:</label>
        <select 
          id="color"
          v-model="color"
          :class="{ 'has-error': errors.color }"
        >
          <option value="" disabled>Выберите цвет</option>
          <option v-for="colorOption in availableColors" :key="colorOption.value" :value="colorOption.value">
            {{ colorOption.label }}
          </option>
        </select>
        <div v-if="errors.color" class="error-message">{{ errors.color }}</div>
      </div>
      
      <div class="form-group">
        <label for="length">Длина нити (м):</label>
        <input 
          id="length"
          v-model.number="length"
          type="number"
          min="0.1"
          step="0.1"
          :class="{ 'has-error': errors.length }"
        />
        <div v-if="errors.length" class="error-message">{{ errors.length }}</div>
      </div>
      
      <div class="form-actions">
        <button type="submit">Добавить</button>
        <button type="button" @click="emit('cancel')" class="cancel-btn">Отмена</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.plastic-form {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.plastic-form h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
}

input, select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input.has-error, select.has-error {
  border-color: #ef4444;
}

.error-message {
  margin-top: 0.25rem;
  color: #ef4444;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

button[type="submit"] {
  background-color: #10b981;
  color: white;
}

button[type="submit"]:hover {
  background-color: #059669;
}

.cancel-btn {
  background-color: #e5e7eb;
  color: #4b5563;
}

.cancel-btn:hover {
  background-color: #d1d5db;
}
</style>