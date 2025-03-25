<script setup lang="ts">
import AppHeader from './components/shared/AppHeader.vue';
import AppFooter from './components/shared/AppFooter.vue';
</script>

<template>
  <div class="app-wrapper">
    <AppHeader />
    <main class="main-content">
      <div class="container">
        <RouterView />
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<style>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>