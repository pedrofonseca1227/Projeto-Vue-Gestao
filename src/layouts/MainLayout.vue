<template>
  <div>
    <NavBar />

    <main class="container py-4">
      <router-view /> <!-- Todas as views serão renderizadas aqui -->
    </main>

    <Footer />
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'

export default {
  components: { NavBar, Footer }
}
</script>

<style scoped>
main {
  min-height: calc(100vh - 120px);
}
</style>
