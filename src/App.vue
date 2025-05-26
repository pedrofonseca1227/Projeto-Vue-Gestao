<template>
  <div id="app">
    <!-- Só exibe a Navbar se a rota não for '/' -->
    <NavbarComponent v-if="$route.path !== '/'" />

    <div class="container mt-4">
      <router-view /> <!-- Renderiza dinamicamente a view atual -->
    </div>
  </div>
</template>

<script>
import NavbarComponent from '@/components/NavbarComponent.vue';

export default {
  components: {
    NavbarComponent
  }
};
</script>

<style>
/* Estilos adicionais */
</style>
