<script setup lang="ts">
import { PrinterStatus } from '@/types';
import type { Printer } from '@/types';

const props = defineProps<{
  printer: Printer;
}>();

const emit = defineEmits<{
  edit: [id: number];
  delete: [id: number];
}>();

const isPrinterBusy = () => {
  return props.printer.status === PrinterStatus.PRINTING || props.printer.plasticId !== undefined;
};

const getStatusClass = () => {
  switch (props.printer.status) {
    case PrinterStatus.PRINTING:
      return 'status-printing';
    case PrinterStatus.ERROR:
      return 'status-error';
    default:
      return 'status-idle';
  }
};

const getStatusText = () => {
  switch (props.printer.status) {
    case PrinterStatus.PRINTING:
      return 'Печатает';
    case PrinterStatus.ERROR:
      return 'Ошибка';
    default:
      return 'Простаивает';
  }
};
</script>

<template>
  <div class="printer-card">
    <div class="printer-header">
      <h3>{{ printer.brand }}</h3>
      <div :class="['status-badge', getStatusClass()]">
        {{ getStatusText() }}
      </div>
    </div>
    
    <div class="printer-details">
      <p><strong>Артикул:</strong> {{ printer.articleNumber }}</p>
      <p><strong>Скорость печати:</strong> {{ printer.printSpeed }} мм/с</p>
      <p v-if="printer.plasticId"><strong>Пластик:</strong> Установлен (ID: {{ printer.plasticId }})</p>
      <p v-else><strong>Пластик:</strong> Не установлен</p>
      
      <div v-if="printer.status === PrinterStatus.PRINTING" class="printing-progress">
        <div class="progress-label">Прогресс печати:</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${printer.printingProgress || 0}%` }"></div>
        </div>
        <div class="progress-percentage">{{ printer.printingProgress || 0 }}%</div>
      </div>
      
      <div v-if="printer.status === PrinterStatus.ERROR" class="error-message">
        {{ printer.errorMessage }}
      </div>
    </div>
    
    <div class="printer-actions">
      <button @click="emit('edit', printer.id)" :disabled="isPrinterBusy()">
        Редактировать
      </button>
      <button @click="emit('delete', printer.id)" :disabled="isPrinterBusy()" class="delete-btn">
        Удалить
      </button>
    </div>
    
    <div v-if="isPrinterBusy()" class="busy-message">
      <p v-if="printer.status === PrinterStatus.PRINTING">
        Нельзя редактировать или удалить принтер во время печати
      </p>
      <p v-else-if="printer.plasticId">
        Нельзя редактировать или удалить принтер с установленным пластиком
      </p>
    </div>
  </div>
</template>

<style scoped>
.printer-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.printer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.printer-header h3 {
  margin: 0;
  color: #2c3e50;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-idle {
  background-color: #e2e8f0;
  color: #64748b;
}

.status-printing {
  background-color: #dbeafe;
  color: #3b82f6;
}

.status-error {
  background-color: #fee2e2;
  color: #ef4444;
}

.printer-details {
  margin-bottom: 1rem;
}

.printer-details p {
  margin: 0.5rem 0;
}

.printing-progress {
  margin-top: 1rem;
}

.progress-label {
  margin-bottom: 0.25rem;
  font-weight: bold;
}

.progress-bar {
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.3s ease;
}

.error-message {
  margin-top: 1rem;
  color: #ef4444;
  font-weight: bold;
}

.printer-actions {
  display: flex;
  gap: 0.5rem;
}

.delete-btn {
  background-color: #ef4444;
}

.delete-btn:hover {
  background-color: #dc2626;
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