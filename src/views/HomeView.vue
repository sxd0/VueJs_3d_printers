<script setup lang="ts">
</script>

<template>
  <div class="home">
    <h1>Главная страница</h1>
    <p>Управление 3D-принтерами, пластиками и моделями</p>
    <div class="dashboard-section">
      <h2>Быстрый доступ</h2>
      <div class="dashboard-cards">
        <div class="dashboard-card" @click="$router.push('/printers')">
          <h3>Принтеры</h3>
          <p>Управление принтерами</p>
        </div>
        <div class="dashboard-card" @click="$router.push('/plastics')">
          <h3>Пластики</h3>
          <p>Управление пластиками</p>
        </div>
        <div class="dashboard-card" @click="$router.push('/models')">
          <h3>Модели</h3>
          <p>Управление моделями</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home h1 {
  margin-bottom: 1rem;
}

.dashboard-section {
  margin-top: 2rem;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.dashboard-card {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.dashboard-card h3 {
  color: #42b983;
  margin-bottom: 0.5rem;
}
</style>