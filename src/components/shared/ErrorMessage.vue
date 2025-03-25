<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>

<template>
  <div class="error-container">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
    <p>{{ message }}</p>
  </div>
</template>

<style scoped>
.error-container {
  display: flex;
  align-items: center;
  background-color: #fee;
  border: 1px solid #e74c3c;
  border-radius: 4px;
  padding: 1rem;
  color: #e74c3c;
  margin-bottom: 1rem;
}

.error-container svg {
  margin-right: 0.5rem;
}
</style>