<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { modelsApi } from '@/services/api';
import type { Model } from '@/types';
import { ModelStatus } from '@/types';
import ModelCard from '@/components/models/ModelCard.vue';
import ModelForm from '@/components/models/ModelForm.vue';
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue';
import ErrorMessage from '@/components/shared/ErrorMessage.vue';

const models = ref<Model[]>([]);
const loading = ref(true);
const error = ref('');
const showForm = ref(false);
const sortBy = ref<'name' | 'date'>('date');
const sortDirection = ref<'asc' | 'desc'>('desc');

const createdModels = computed(() => {
  return sortModels(models.value.filter(model => model.status === ModelStatus.CREATED));
});

const printingModels = computed(() => {
  return sortModels(models.value.filter(model => model.status === ModelStatus.PRINTING));
});

const completedModels = computed(() => {
  return sortModels(models.value.filter(model => model.status === ModelStatus.COMPLETED));
});

const sortModels = (modelsList: Model[]) => {
  return [...modelsList].sort((a, b) => {
    if (sortBy.value === 'name') {
      return sortDirection.value === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else {
      return sortDirection.value === 'asc' 
        ? new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime()
        : new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime();
    }
  });
};

const toggleSort = (by: 'name' | 'date') => {
  if (sortBy.value === by) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = by;
    sortDirection.value = 'asc';
  }
};

const fetchModels = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    models.value = await modelsApi.getAll();
  } catch (err) {
    error.value = 'Не удалось загрузить модели. Проверьте подключение к серверу.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleAddModel = () => {
  showForm.value = true;
};

const handleDeleteModel = async (id: number) => {
  if (!confirm('Вы уверены, что хотите удалить эту модель?')) return;
  
  try {
    await modelsApi.delete(id);
    models.value = models.value.filter(model => model.id !== id);
  } catch (err) {
    error.value = 'Не удалось удалить модель.';
    console.error(err);
  }
};

const handleCopyModel = async (model: Model) => {
  try {
    const copyData: Omit<Model, 'id'> = {
      name: `${model.name} (копия)`,
      perimeterLength: model.perimeterLength,
      creationDate: new Date().toISOString(),
      status: ModelStatus.CREATED
    };
    
    const newModel = await modelsApi.create(copyData);
    models.value.push(newModel);
  } catch (err) {
    error.value = 'Не удалось создать копию модели.';
    console.error(err);
  }
};

const handleSaveModel = async (modelData: Omit<Model, 'id'>) => {
  try {
    const newModel = await modelsApi.create(modelData);
    models.value.push(newModel);
    showForm.value = false;
  } catch (err) {
    error.value = 'Не удалось сохранить модель.';
    console.error(err);
  }
};

onMounted(fetchModels);
</script>

<template>
  <div class="models-view">
    <div class="header">
      <h1>Управление моделями</h1>
      <button @click="handleAddModel" v-if="!showForm">Добавить модель</button>
    </div>
    
    <ErrorMessage v-if="error" :message="error" />
    
    <ModelForm 
      v-if="showForm"
      @save="handleSaveModel"
      @cancel="showForm = false"
    />
    
    <LoadingSpinner v-if="loading" />
    
    <div v-else-if="models.length === 0 && !error" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
      <p>У вас пока нет моделей. Нажмите "Добавить модель", чтобы начать.</p>
    </div>
    
    <div v-else class="models-container">
      <div class="sort-controls">
        <span>Сортировать по:</span>
        <button 
          @click="toggleSort('name')" 
          :class="{ 'active': sortBy === 'name' }"
          class="sort-btn"
        >
          Имени
          <span v-if="sortBy === 'name'">
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </span>
        </button>
        <button 
          @click="toggleSort('date')"
          :class="{ 'active': sortBy === 'date' }"
          class="sort-btn"
        >
          Дате
          <span v-if="sortBy === 'date'">
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </span>
        </button>
      </div>
      
      <div v-if="createdModels.length > 0" class="models-section">
        <h2>Созданные модели</h2>
        <div class="models-list">
          <ModelCard 
            v-for="model in createdModels" 
            :key="model.id" 
            :model="model" 
            @delete="handleDeleteModel"
            @copy="handleCopyModel"
          />
        </div>
      </div>
      
      <div v-if="printingModels.length > 0" class="models-section">
        <h2>Модели в печати</h2>
        <div class="models-list">
          <ModelCard 
            v-for="model in printingModels" 
            :key="model.id" 
            :model="model"
          />
        </div>
      </div>
      
      <div v-if="completedModels.length > 0" class="models-section">
        <h2>Готовые модели</h2>
        <div class="models-list">
          <ModelCard 
            v-for="model in completedModels" 
            :key="model.id" 
            :model="model"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.models-view {
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

.sort-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.sort-btn {
  padding: 0.5rem 1rem;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #64748b;
  font-weight: normal;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.sort-btn.active {
  background-color: #e0f2fe;
  color: #3b82f6;
  border-color: #bfdbfe;
  font-weight: bold;
}

.models-section {
  margin-bottom: 2rem;
}

.models-section h2 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.models-list {
  display: grid;
  gap: 1rem;
}
</style>