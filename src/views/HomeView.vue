<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { printersApi, plasticsApi, modelsApi } from '@/services/api';
import type { Printer, Plastic, Model } from '@/types';
import PrinterPanel from '@/components/home/PrinterPanel.vue';
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue';
import ErrorMessage from '@/components/shared/ErrorMessage.vue';

const printers = ref<Printer[]>([]);
const plastics = ref<Plastic[]>([]);
const models = ref<Model[]>([]);
const loading = ref(true);
const error = ref('');
const refreshInterval = ref<number | null>(null);

const fetchData = async () => {
  try {
    const [printersData, plasticsData, modelsData] = await Promise.all([
      printersApi.getAll(),
      plasticsApi.getAll(),
      modelsApi.getAll()
    ]);
    
    printers.value = printersData;
    plastics.value = plasticsData;
    models.value = modelsData;
    
    error.value = '';
  } catch (err) {
    error.value = 'Не удалось загрузить данные. Проверьте подключение к серверу.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const setupRefreshInterval = () => {
  refreshInterval.value = window.setInterval(() => {
    fetchData();
  }, 5000); // Обновление данных каждые 5 секунд
};

onMounted(() => {
  fetchData().then(() => {
    setupRefreshInterval();
  });
});

onBeforeUnmount(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<template>
  <div class="home-view">
    <div class="header">
      <h1>Панель управления 3D-принтерами</h1>
    </div>
    
    <ErrorMessage v-if="error" :message="error" />
    
    <LoadingSpinner v-if="loading" />
    
    <div v-else-if="printers.length === 0" class="empty-state">
      <p>У вас пока нет принтеров. Перейдите на страницу "Принтеры", чтобы добавить принтер.</p>
    </div>
    
    <div v-else class="dashboard-container">
      <div class="printer-panels">
        <h2>Принтеры</h2>
        <PrinterPanel 
          v-for="printer in printers" 
          :key="printer.id" 
          :printer="printer"
          :plastics="plastics"
          :models="models"
          @update-data="fetchData"
        />
      </div>
      
      <div class="stats-container">
        <div class="stats-card">
          <h3>Пластики</h3>
          <p v-if="plastics.length === 0">Нет доступных пластиков</p>
          <ul v-else class="plastics-list">
            <li v-for="plastic in plastics" :key="plastic.id">
              <div :class="['color-dot', `color-${plastic.color.toLowerCase()}`]"></div>
              <div class="plastic-details">
                <div>{{ plastic.material }} ({{ plastic.color }})</div>
                <div class="plastic-length">{{ plastic.length.toFixed(1) }} м</div>
              </div>
              <div v-if="plastic.isInstalled" class="plastic-status">Установлен</div>
            </li>
          </ul>
        </div>
        
        <div class="stats-card">
          <h3>Модели</h3>
          <p v-if="models.length === 0">Нет доступных моделей</p>
          <ul v-else class="models-list">
            <li v-for="model in models" :key="model.id">
              <div class="model-name">{{ model.name }}</div>
              <div class="model-status">{{ model.status }}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #64748b;
}

.dashboard-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.printer-panels h2, .stats-container h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stats-card {
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.plastics-list, .models-list {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.plastics-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.plastics-list li:last-child {
  border-bottom: none;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
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
  flex-grow: 1;
  font-size: 0.875rem;
}

.plastic-length {
  color: #64748b;
  font-size: 0.75rem;
}

.plastic-status {
  padding: 0.25rem 0.5rem;
  background-color: #dbeafe;
  color: #3b82f6;
  border-radius: 4px;
  font-size: 0.75rem;
}

.models-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.875rem;
}

.models-list li:last-child {
  border-bottom: none;
}

.model-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: capitalize;
}

@media (max-width: 768px) {
  .dashboard-container {
    grid-template-columns: 1fr;
  }
}
</style>