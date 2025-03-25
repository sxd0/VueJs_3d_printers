<script setup lang="ts">
import type { Plastic } from '@/types';

const props = defineProps<{
  plastic: Plastic;
}>();

const emit = defineEmits<{
  delete: [id: number];
}>();

const getColorClass = () => {
  return `color-${props.plastic.color.toLowerCase()}`;
};
</script>

<template>
  <div class="plastic-card">
    <div class="plastic-header">
      <h3>{{ plastic.material }}</h3>
      <div :class="['color-badge', getColorClass()]"></div>
    </div>
    
    <div class="plastic-details">
      <p><strong>Цвет:</strong> {{ plastic.color }}</p>
      <p><strong>Длина нити:</strong> {{ plastic.length.toFixed(1) }} м</p>
      <div class="length-bar">
        <div class="length-fill" :style="{ width: `${Math.min(100, plastic.length)}%` }"></div>
      </div>
      
      <div v-if="plastic.isInstalled" class="installed-badge">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>Установлен в принтер</span>
      </div>
    </div>
    
    <div class="plastic-actions">
      <button @click="emit('delete', plastic.id)" :disabled="plastic.isInstalled" class="delete-btn">
        Удалить
      </button>
    </div>
    
    <div v-if="plastic.isInstalled" class="busy-message">
      <p>Нельзя удалить пластик, установленный в принтер. Сначала извлеките его из принтера.</p>
    </div>
  </div>
</template>

<style scoped>
.plastic-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.plastic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.plastic-header h3 {
  margin: 0;
  color: #2c3e50;
}

.color-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.color-red {
  background-color: #ef4444;
}

.color-blue {
  background-color: #3b82f6;
}

.color-green {
  background-color: #10b981;
}

.color-yellow {
  background-color: #f59e0b;
}

.color-black {
  background-color: #1f2937;
}

.plastic-details {
  margin-bottom: 1rem;
}

.plastic-details p {
  margin: 0.5rem 0;
}

.length-bar {
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin: 0.5rem 0;
}

.length-fill {
  height: 100%;
  background-color: #10b981;
  transition: width 0.3s ease;
}

.installed-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: #dbeafe;
  color: #3b82f6;
  border-radius: 4px;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.plastic-actions {
  display: flex;
  justify-content: flex-end;
}

.delete-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #dc2626;
}

.delete-btn:disabled {
  background-color: #fca5a5;
  cursor: not-allowed;
}

.busy-message {
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #fee2e2;
  border-radius: 4px;
  color: #ef4444;
  font-size: 0.875rem;
}
</style>