<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Printer } from '@/types';
import { PrinterStatus } from '@/types';

const props = defineProps<{
  printer?: Printer;
  isEditing: boolean;
}>();

const emit = defineEmits<{
  save: [printer: Omit<Printer, 'id'>];
  cancel: [];
}>();

const brand = ref('');
const articleNumber = ref('');
const printSpeed = ref<number>(60);
const errors = ref<Record<string, string>>({});

watch(() => props.printer, () => {
  if (props.printer) {
    brand.value = props.printer.brand;
    articleNumber.value = props.printer.articleNumber;
    printSpeed.value = props.printer.printSpeed;
  }
}, { immediate: true });

const validate = (): boolean => {
  errors.value = {};
  
  if (!brand.value.trim()) {
    errors.value.brand = 'Марка принтера обязательна';
  }
  
  if (!articleNumber.value.trim()) {
    errors.value.articleNumber = 'Артикул обязателен';
  }
  
  if (!printSpeed.value || printSpeed.value <= 0) {
    errors.value.printSpeed = 'Скорость печати должна быть положительным числом';
  }
  
  return Object.keys(errors.value).length === 0;
};

const handleSubmit = () => {
  if (!validate()) return;
  
  const newPrinter: Omit<Printer, 'id'> = {
    brand: brand.value,
    articleNumber: articleNumber.value,
    printSpeed: printSpeed.value,
    status: PrinterStatus.IDLE
  };
  
  emit('save', newPrinter);
};
</script>

<template>
  <div class="printer-form">
    <h2>{{ isEditing ? 'Редактировать принтер' : 'Добавить принтер' }}</h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="brand">Марка принтера:</label>
        <input 
          id="brand"
          v-model="brand"
          type="text"
          :class="{ 'has-error': errors.brand }"
        />
        <div v-if="errors.brand" class="error-message">{{ errors.brand }}</div>
      </div>
      
      <div class="form-group">
        <label for="articleNumber">Артикул:</label>
        <input 
          id="articleNumber"
          v-model="articleNumber"
          type="text"
          :class="{ 'has-error': errors.articleNumber }"
        />
        <div v-if="errors.articleNumber" class="error-message">{{ errors.articleNumber }}</div>
      </div>
      
      <div class="form-group">
        <label for="printSpeed">Скорость печати (мм/с):</label>
        <input 
          id="printSpeed"
          v-model.number="printSpeed"
          type="number"
          min="1"
          step="1"
          :class="{ 'has-error': errors.printSpeed }"
        />
        <div v-if="errors.printSpeed" class="error-message">{{ errors.printSpeed }}</div>
      </div>
      
      <div class="form-actions">
        <button type="submit">{{ isEditing ? 'Сохранить' : 'Добавить' }}</button>
        <button type="button" @click="emit('cancel')" class="cancel-btn">Отмена</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.printer-form {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.printer-form h2 {
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