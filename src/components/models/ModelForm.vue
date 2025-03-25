<script setup lang="ts">
import { ref } from 'vue';
import type { Model } from '@/types';
import { ModelStatus } from '@/types';

const emit = defineEmits<{
  save: [model: Omit<Model, 'id'>];
  cancel: [];
}>();

const name = ref('');
const perimeterLength = ref<number>(1);
const errors = ref<Record<string, string>>({});

const validate = (): boolean => {
  errors.value = {};
  
  if (!name.value.trim()) {
    errors.value.name = 'Имя модели обязательно';
  }
  
  if (!perimeterLength.value || perimeterLength.value <= 0) {
    errors.value.perimeterLength = 'Длина периметра должна быть положительным числом';
  }
  
  return Object.keys(errors.value).length === 0;
};

const handleSubmit = () => {
  if (!validate()) return;
  
  const newModel: Omit<Model, 'id'> = {
    name: name.value,
    perimeterLength: perimeterLength.value,
    creationDate: new Date().toISOString(),
    status: ModelStatus.CREATED
  };
  
  emit('save', newModel);
  resetForm();
};

const resetForm = () => {
  name.value = '';
  perimeterLength.value = 1;
  errors.value = {};
};
</script>

<template>
  <div class="model-form">
    <h2>Добавить новую модель</h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">Имя модели:</label>
        <input 
          id="name"
          v-model="name"
          type="text"
          placeholder="Введите имя модели"
          :class="{ 'has-error': errors.name }"
        />
        <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
      </div>
      
      <div class="form-group">
        <label for="perimeterLength">Длина периметра (м):</label>
        <input 
          id="perimeterLength"
          v-model.number="perimeterLength"
          type="number"
          min="0.1"
          step="0.1"
          :class="{ 'has-error': errors.perimeterLength }"
        />
        <div v-if="errors.perimeterLength" class="error-message">{{ errors.perimeterLength }}</div>
      </div>
      
      <div class="form-actions">
        <button type="submit">Добавить</button>
        <button type="button" @click="emit('cancel')" class="cancel-btn">Отмена</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.model-form {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.model-form h2 {
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

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input.has-error {
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
  background-color: #3b82f6;
  color: white;
}

button[type="submit"]:hover {
  background-color: #2563eb;
}

.cancel-btn {
  background-color: #e5e7eb;
  color: #4b5563;
}

.cancel-btn:hover {
  background-color: #d1d5db;
}
</style>