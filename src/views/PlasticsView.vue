<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { plasticsApi } from '@/services/api';
import type { Plastic } from '@/types';
import PlasticCard from '@/components/plastics/PlasticCard.vue';
import PlasticForm from '@/components/plastics/PlasticForm.vue';
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue';
import ErrorMessage from '@/components/shared/ErrorMessage.vue';

const plastics = ref<Plastic[]>([]);
const loading = ref(true);
const error = ref('');
const showForm = ref(false);

const fetchPlastics = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    plastics.value = await plasticsApi.getAll();
  } catch (err) {
    error.value = 'Не удалось загрузить пластики. Проверьте подключение к серверу.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleAddPlastic = () => {
  showForm.value = true;
};

const handleDeletePlastic = async (id: number) => {
  if (!confirm('Вы уверены, что хотите удалить этот пластик?')) return;
  
  try {
    await plasticsApi.delete(id);
    plastics.value = plastics.value.filter(plastic => plastic.id !== id);
  } catch (err) {
    error.value = 'Не удалось удалить пластик.';
    console.error(err);
  }
};

const handleSavePlastic = async (plasticData: Omit<Plastic, 'id'>) => {
  try {
    const newPlastic = await plasticsApi.create(plasticData);
    plastics.value.push(newPlastic);
    showForm.value = false;
  } catch (err) {
    error.value = 'Не удалось сохранить пластик.';
    console.error(err);
  }
};

onMounted(fetchPlastics);
</script>

<template>
  <div class="plastics-view">
    <div class="header">
      <h1>Управление пластиками</h1>
      <button @click="handleAddPlastic" v-if="!showForm">Добавить пластик</button>
    </div>
    
    <ErrorMessage v-if="error" :message="error" />
    
    <PlasticForm 
      v-if="showForm"
      @save="handleSavePlastic"
      @cancel="showForm = false"
    />
    
    <LoadingSpinner v-if="loading" />
    
    <div v-else-if="plastics.length === 0 && !error" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      <p>У вас пока нет пластиков. Нажмите "Добавить пластик", чтобы начать.</p>
    </div>
    
    <div v-else class="plastics-list">
      <PlasticCard 
        v-for="plastic in plastics" 
        :key="plastic.id" 
        :plastic="plastic" 
        @delete="handleDeletePlastic"
      />
    </div>
  </div>
</template>

<style scoped>
.plastics-view {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  text-align: center;
  color: #64748b;
}

.empty-state svg {
  margin-bottom: 1rem;
  color: #94a3b8;
}

.plastics-list {
  display: grid;
  gap: 1.5rem;
}
</style>