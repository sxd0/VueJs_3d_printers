<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <header class="app-header">
    <div class="logo">3D-Printer App</div>
    <nav>
      <RouterLink to="/" class="nav-link">Главная</RouterLink>
      <RouterLink to="/printers" class="nav-link">Принтеры</RouterLink>
      <RouterLink to="/plastics" class="nav-link">Пластики</RouterLink>
      <RouterLink to="/models" class="nav-link">Модели</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2c3e50;
  color: white;
}

.logo {
  font-weight: bold;
  font-size: 1.5rem;
}

nav {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: #fff;
  text-decoration: none;
  padding: 0.5rem 0;
  position: relative;
}

.nav-link:hover {
  color: #42b983;
}

.nav-link.router-link-active {
  color: #42b983;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #42b983;
}
</style>