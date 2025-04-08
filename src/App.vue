<template>
  <div id="app">
    <NavbarComponent /> <!-- Use o nome correto aqui -->
    <div class="container mt-4">
      <router-view /> <!-- Aqui são carregadas as páginas dinamicamente -->
    </div>
  </div>
</template>

<script>
import { RouterView } from 'vue-router';
import NavbarComponent from '@/components/NavbarComponent.vue'; // Certifique-se de que o nome do arquivo e o nome do componente correspondam

export default {
  components: {
    NavbarComponent,  // Use o nome correto do componente
    RouterView,
  },
};
</script>

<style>
/* Estilos adicionais */
</style>
