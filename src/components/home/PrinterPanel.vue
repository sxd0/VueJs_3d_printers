<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Printer, Plastic, Model, PrinterError } from '@/types';
import { PrinterStatus, ModelStatus, PrinterErrorType } from '@/types';
import { PrinterService } from '@/services/printer-service';
import { printersApi, plasticsApi, modelsApi } from '@/services/api';

const props = defineProps<{
  printer: Printer;
  plastics: Plastic[];
  models: Model[];
}>();

const emit = defineEmits<{
  updateData: [];
}>();

const selectedPlasticId = ref<number | null>(null);
const selectedModelId = ref<number | null>(null);
const isPrinting = ref(false);
const printProgress = ref(0);
const printingInterval = ref<number | null>(null);
const errorMessage = ref('');

const installedPlastic = computed(() => {
  if (!props.printer.plasticId) return null;
  return props.plastics.find(p => p.id === props.printer.plasticId);
});

const availablePlastics = computed(() => {
  return props.plastics.filter(p => !p.isInstalled || p.printerId === props.printer.id);
});

const printableModels = computed(() => {
  return props.models.filter(m => m.status === ModelStatus.CREATED);
});

const printingModel = computed(() => {
  if (!props.printer.currentModelId) return null;
  return props.models.find(m => m.id === props.printer.currentModelId);
});

const printerModels = computed(() => {
  return props.models.filter(m => 
    m.status === ModelStatus.PRINTING && 
    m.printerId === props.printer.id && 
    m.id !== props.printer.currentModelId
  );
});

const installPlastic = async () => {
  if (!selectedPlasticId.value) return;
  
  const result = await PrinterService.installPlastic(
    props.printer.id, 
    selectedPlasticId.value
  );
  
  if (result) {
    selectedPlasticId.value = null;
    emit('updateData');
  } else {
    errorMessage.value = 'Не удалось установить пластик в принтер';
  }
};

const removePlastic = async () => {
  const result = await PrinterService.removePlastic(props.printer.id);
  
  if (result) {
    emit('updateData');
  } else {
    errorMessage.value = 'Не удалось извлечь пластик из принтера';
  }
};

const addModelToPrint = async () => {
  if (!selectedModelId.value) return;
  
  errorMessage.value = '';
  
  const model = props.models.find(m => m.id === selectedModelId.value);
  const plastic = installedPlastic.value;
  
  if (!model || !plastic) return;
  
  if (plastic.length < model.perimeterLength) {
    errorMessage.value = 'Недостаточно пластика для печати этой модели';
    return;
  }
  
  const result = await PrinterService.addModelToPrinter(
    props.printer.id,
    selectedModelId.value
  );
  
  if (result) {
    selectedModelId.value = null;
    emit('updateData');

    if (props.printer.status !== PrinterStatus.PRINTING) {
      startPrinting();
    }
  } else {
    errorMessage.value = 'Не удалось добавить модель в очередь на печать';
  }
};

const startPrinting = async () => {
  if (isPrinting.value || !printingModel.value || !installedPlastic.value) return;
  
  isPrinting.value = true;
  printProgress.value = 0;
  
  await printersApi.update(props.printer.id, {
    status: PrinterStatus.PRINTING,
    printingProgress: 0
  });
  
  printingInterval.value = window.setInterval(async () => {
    printProgress.value += 5;
    
    const error = PrinterService.generateRandomError(printingModel.value!.id);
    
    if (error) {
      await handlePrintError(error);
      return;
    }
    
    await printersApi.update(props.printer.id, {
      printingProgress: printProgress.value
    });
    
    if (printProgress.value >= 100) {
      await completePrinting();
    }
  }, 1000);
};

const handlePrintError = async (error: PrinterError) => {
  clearInterval(printingInterval.value!);
  printingInterval.value = null;
  isPrinting.value = false;
  
  await printersApi.update(props.printer.id, {
    status: PrinterStatus.ERROR,
    errorMessage: error.message
  });
  
  errorMessage.value = `Ошибка печати: ${error.type}`;
  
  emit('updateData');
};

const completePrinting = async () => {
  clearInterval(printingInterval.value!);
  printingInterval.value = null;
  isPrinting.value = false;
  
  const plastic = installedPlastic.value;
  const model = printingModel.value;
  
  if (!plastic || !model) return;
  
  const newLength = Math.max(0, plastic.length - model.perimeterLength);
  await plasticsApi.update(plastic.id, {
    length: newLength
  });
  
  await modelsApi.update(model.id, {
    status: ModelStatus.COMPLETED,
    plasticColor: plastic.color
  });
  
  const nextModel = printerModels.value[0];
  
  if (nextModel) {
    await printersApi.update(props.printer.id, {
      currentModelId: nextModel.id,
      printingProgress: 0
    });
    
    printProgress.value = 0;
    setTimeout(startPrinting, 1000);
  } else {
    await printersApi.update(props.printer.id, {
      status: PrinterStatus.IDLE,
      currentModelId: undefined,
      printingProgress: undefined
    });
  }
  
  emit('updateData');
};

const resetPrinter = async () => {
  if (printingInterval.value) {
    clearInterval(printingInterval.value);
    printingInterval.value = null;
  }
  
  isPrinting.value = false;
  printProgress.value = 0;
  errorMessage.value = '';
  
  await printersApi.update(props.printer.id, {
    status: PrinterStatus.IDLE,
    errorMessage: undefined
  });
  
  emit('updateData');
};
</script>

<template>
  <div class="printer-panel" :class="{ 'has-error': props.printer.status === PrinterStatus.ERROR }">
    <div class="printer-header">
      <h3>{{ printer.brand }} ({{ printer.articleNumber }})</h3>
      <div :class="['status-badge', `status-${printer.status.toLowerCase()}`]">
        {{ printer.status === PrinterStatus.IDLE ? 'Готов к работе' : 
           printer.status === PrinterStatus.PRINTING ? 'Печатает' : 'Ошибка' }}
      </div>
    </div>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <div class="printer-content">
      <div class="plastic-section">
        <h4>Пластик</h4>
        <div v-if="installedPlastic" class="installed-plastic">
          <div class="plastic-info">
            <div :class="['color-dot', `color-${installedPlastic.color.toLowerCase()}`]"></div>
            <div>
              <strong>{{ installedPlastic.material }}</strong>
              <div>Цвет: {{ installedPlastic.color }}</div>
              <div>Осталось: {{ installedPlastic.length.toFixed(1) }} м</div>
            </div>
          </div>
          <button @click="removePlastic" :disabled="printer.status === PrinterStatus.PRINTING">
            Извлечь
          </button>
        </div>
        <div v-else class="plastic-selector">
          <select v-model="selectedPlasticId">
            <option :value="null" disabled>Выберите пластик</option>
            <option v-for="plastic in availablePlastics" :key="plastic.id" :value="plastic.id">
              {{ plastic.material }} ({{ plastic.color }}) - {{ plastic.length.toFixed(1) }}м
            </option>
          </select>
          <button @click="installPlastic" :disabled="!selectedPlasticId">
            Установить
          </button>
        </div>
      </div>
      
      <div class="models-section">
        <h4>Модели</h4>
        
        <div v-if="printingModel" class="current-model">
          <h5>Текущая печать:</h5>
          <div class="model-info">
            <div>{{ printingModel.name }}</div>
            <div>Длина: {{ printingModel.perimeterLength.toFixed(1) }} м</div>
          </div>
          
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${printer.printingProgress || 0}%` }"></div>
            <div class="progress-label">{{ printer.printingProgress || 0 }}%</div>
          </div>
        </div>
        
        <div class="model-queue" v-if="printerModels.length > 0">
          <h5>В очереди:</h5>
          <ul>
            <li v-for="model in printerModels" :key="model.id">
              {{ model.name }} ({{ model.perimeterLength.toFixed(1) }} м)
            </li>
          </ul>
        </div>
        
        <div v-if="installedPlastic && printer.status !== PrinterStatus.ERROR" class="model-selector">
          <select v-model="selectedModelId">
            <option :value="null" disabled>Выберите модель для печати</option>
            <option v-for="model in printableModels" :key="model.id" :value="model.id">
              {{ model.name }} ({{ model.perimeterLength.toFixed(1) }} м)
            </option>
          </select>
          <button @click="addModelToPrint" :disabled="!selectedModelId || !installedPlastic">
            Добавить в очередь
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="printer.status === PrinterStatus.ERROR" class="reset-section">
      <p>{{ printer.errorMessage }}</p>
      <button @click="resetPrinter" class="reset-btn">Сбросить ошибку</button>
    </div>
  </div>
</template>

<style scoped>
.printer-panel {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.printer-panel.has-error {
  border-color: #ef4444;
  background-color: #fef2f2;
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

.error-message {
  background-color: #fee2e2;
  padding: 0.75rem;
  border-radius: 4px;
  color: #ef4444;
  margin-bottom: 1rem;
}

.printer-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #4b5563;
  font-size: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

h5 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #4b5563;
  font-size: 0.875rem;
}

.installed-plastic {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plastic-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.color-dot {
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

.plastic-selector, .model-selector {
  display: flex;
  gap: 0.5rem;
}

select {
  flex-grow: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #3b82f6;
  color: white;
  cursor: pointer;
  white-space: nowrap;
}

button:hover {
  background-color: #2563eb;
}

button:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}

.current-model {
  margin-bottom: 1rem;
}

.model-info {
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 1rem;
  background-color: #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.3s;
}

.progress-label {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.75rem;
  font-weight: bold;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

.model-queue {
  margin-bottom: 1rem;
}

.model-queue ul {
  list-style-type: none;
  padding-left: 0;
  margin-top: 0.5rem;
}

.model-queue li {
  padding: 0.5rem;
  background-color: #f1f5f9;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.reset-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #ef4444;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.reset-btn {
  background-color: #ef4444;
}

.reset-btn:hover {
  background-color: #dc2626;
}

@media (max-width: 640px) {
  .printer-content {
    grid-template-columns: 1fr;
  }
}
</style>