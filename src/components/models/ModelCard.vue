<script setup lang="ts">
import type { Model } from '@/types';
import { ModelStatus } from '@/types';

const props = defineProps<{
  model: Model;
}>();

const emit = defineEmits<{
  delete: [id: number];
  copy: [model: Model];
}>();

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusText = () => {
  switch (props.model.status) {
    case ModelStatus.CREATED:
      return 'Создана';
    case ModelStatus.PRINTING:
      return 'В печати';
    case ModelStatus.COMPLETED:
      return 'Готова';
    default:
      return 'Неизвестно';
  }
};

const getStatusClass = () => {
  return `status-${props.model.status}`;
};

const getColorStyle = () => {
  if (!props.model.plasticColor) return {};
  
  return {
    borderColor: getColorValue(props.model.plasticColor)
  };
};

const getColorValue = (color: string) => {
  switch (color.toLowerCase()) {
    case 'red': return '#ef4444';
    case 'blue': return '#3b82f6';
    case 'green': return '#10b981';
    case 'yellow': return '#f59e0b';
    case 'black': return '#1f2937';
    default: return '#94a3b8';
  }
};
</script>

<template>
  <div class="model-card" :class="getStatusClass()" :style="getColorStyle()">
    <div class="model-header">
      <h3>{{ model.name }}</h3>
      <div :class="['status-badge', getStatusClass()]">
        {{ getStatusText() }}
      </div>
    </div>
    
    <div class="model-details">
      <p><strong>Длина периметра:</strong> {{ model.perimeterLength.toFixed(1) }} м</p>
      <p><strong>Дата создания:</strong> {{ formatDate(model.creationDate) }}</p>
      
      <p v-if="model.plasticColor">
        <strong>Цвет пластика:</strong>
        <span class="color-dot" :style="{ backgroundColor: getColorValue(model.plasticColor) }"></span>
        {{ model.plasticColor }}
      </p>
    </div>
    
    <div class="model-actions">
      <button 
        v-if="model.status === ModelStatus.CREATED"
        @click="emit('copy', model)"
        class="copy-btn"
      >
        Копировать
      </button>
      <button 
        v-if="model.status === ModelStatus.CREATED"
        @click="emit('delete', model.id)"
        class="delete-btn"
      >
        Удалить
      </button>
    </div>
  </div>
</template>

<style scoped>
.model-card {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.model-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.model-card.status-printing {
  border-left-width: 4px;
}

.model-card.status-completed {
  border-left-width: 4px;
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.model-header h3 {
  margin: 0;
  color: #2c3e50;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-created {
  background-color: #e2e8f0;
  color: #64748b;
}

.status-printing {
  background-color: #dbeafe;
  color: #3b82f6;
}

.status-completed {
  background-color: #d1fae5;
  color: #10b981;
}

.model-details {
  margin-bottom: 1rem;
}

.model-details p {
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
}

.color-dot {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin: 0 0.5rem;
}

.model-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.copy-btn {
  background-color: #3b82f6;
  color: white;
}

.copy-btn:hover {
  background-color: #2563eb;
}

.delete-btn {
  background-color: #ef4444;
  color: white;
}

.delete-btn:hover {
  background-color: #dc2626;
}
</style>