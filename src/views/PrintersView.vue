<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { printersApi } from '@/services/api';
import type { Printer } from '@/types';
import PrinterCard from '@/components/printers/PrinterCard.vue';
import PrinterForm from '@/components/printers/PrinterForm.vue';
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue';
import ErrorMessage from '@/components/shared/ErrorMessage.vue';

const printers = ref<Printer[]>([]);
const loading = ref(true);
const error = ref('');
const showForm = ref(false);
const editingPrinter = ref<Printer | undefined>(undefined);

const fetchPrinters = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    printers.value = await printersApi.getAll();
  } catch (err) {
    error.value = 'Не удалось загрузить принтеры. Проверьте подключение к серверу.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleAddPrinter = () => {
  showForm.value = true;
  editingPrinter.value = undefined;
};

const handleEditPrinter = async (id: number) => {
  try {
    const printer = await printersApi.getById(id);
    if (printer) {
      editingPrinter.value = printer;
      showForm.value = true;
    }
  } catch (err) {
    error.value = 'Не удалось загрузить данные принтера для редактирования.';
    console.error(err);
  }
};

const handleDeletePrinter = async (id: number) => {
  if (!confirm('Вы уверены, что хотите удалить этот принтер?')) return;
  
  try {
    await printersApi.delete(id);
    printers.value = printers.value.filter(printer => printer.id !== id);
  } catch (err) {
    error.value = 'Не удалось удалить принтер.';
    console.error(err);
  }
};

const handleSavePrinter = async (printerData: Omit<Printer, 'id'>) => {
  try {
    if (editingPrinter.value) {
      const updatedPrinter = await printersApi.update(editingPrinter.value.id, printerData);
      const index = printers.value.findIndex(p => p.id === editingPrinter.value?.id);
      if (index !== -1) {
        printers.value[index] = updatedPrinter;
      }
    } else {
      const newPrinter = await printersApi.create(printerData);
      printers.value.push(newPrinter);
    }
    
    showForm.value = false;
    editingPrinter.value = undefined;
  } catch (err) {
    error.value = 'Не удалось сохранить принтер.';
    console.error(err);
  }
};

onMounted(fetchPrinters);
</script>

<template>
  <div class="printers-view">
    <div class="header">
      <h1>Управление принтерами</h1>
      <button @click="handleAddPrinter" v-if="!showForm">Добавить принтер</button>
    </div>
    
    <ErrorMessage v-if="error" :message="error" />
    
    <PrinterForm 
      v-if="showForm"
      :printer="editingPrinter"
      :isEditing="!!editingPrinter"
      @save="handleSavePrinter"
      @cancel="showForm = false"
    />
    
    <LoadingSpinner v-if="loading" />
    
    <div v-else-if="printers.length === 0 && !error" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"></path>
        <line x1="7" y1="12" x2="17" y2="12"></line>
        <line x1="12" y1="17" x2="12" y2="17.01"></line>
        <path d="M14 17l-2-2-2 2"></path>
      </svg>
      <p>У вас пока нет принтеров. Нажмите "Добавить принтер", чтобы начать.</p>
    </div>
    
    <div v-else class="printers-list">
      <PrinterCard 
        v-for="printer in printers" 
        :key="printer.id" 
        :printer="printer" 
        @edit="handleEditPrinter"
        @delete="handleDeletePrinter"
      />
    </div>
  </div>
</template>

<style scoped>
.printers-view {
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

.printers-list {
  display: grid;
  gap: 1.5rem;
}
</style>