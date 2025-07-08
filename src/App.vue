<template>
  <div id="app">
    <!-- Navbar aparece em todas as rotas, exceto na raiz '/' (ex: tela de login) -->
    <NavbarComponent v-if="$route.path !== '/'" />

    <main class="layout-content">
      <router-view />
    </main>

    <footer v-if="$route.path !== '/'" class="layout-footer text-center text-muted">
      <small>© {{ new Date().getFullYear() }} Gestão Fazenda Santa Esméria - Desenvolvido por Fazenda Santa esméria</small>
    </footer>
  </div>
</template>

<script>
import NavbarComponent from '@/components/NavbarComponent.vue'

export default {
  components: {
    NavbarComponent
  }
}
</script>

<style>
body {
  background-color: #f8f9fa;
  font-family: 'Segoe UI', sans-serif;
}

.layout-content {
  min-height: calc(100vh - 110px); /* espaço restante para conteúdo */
  padding: 2rem 1rem;
}

.layout-footer {
  padding: 1rem 0;
  font-size: 0.85rem;
  background-color: #ffffff;
  border-top: 1px solid #dee2e6;
}
</style>
