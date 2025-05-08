<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
    <div class="container-fluid">

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse justify-content-center" id="navbarNav">
        <ul class="navbar-nav align-items-center">
          <!-- Sessão de Produtos -->
          <li class="nav-item">
            <router-link to="/produtos" class="nav-link" active-class="active">
              <i class="fa fa-cogs me-1"></i> Produtos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/relatorios" class="nav-link" active-class="active">
              <i class="fa fa-file-alt me-1"></i> Relatórios
            </router-link>
          </li>

          <!-- Divisor visual -->
          <li class="nav-divider"></li>

          <!-- Título da seção de Gado -->
          <li class="nav-section-title">
            <span><i class="fa fa-cow me-1"></i> Bovinos</span>
          </li>

          <!-- Links da seção Bovinos -->
          <li class="nav-item">
            <router-link to="/contagem" class="nav-link" active-class="active">
              <i class="fa fa-list me-1"></i> Contagem Pasto
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/add-pasto" class="nav-link" active-class="active">
              <i class="fa fa-plus-circle me-1"></i> Adicionar Pasto
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/contagem-confinamento" class="nav-link" active-class="active">
              <i class="fa fa-list me-1"></i> Contagem Confinamento
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/add-confinamento" class="nav-link" active-class="active">
              <i class="fa fa-plus-circle me-1"></i> Adicionar Confinamento
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavbarComponent',
};
</script>

<style scoped>
.navbar {
  padding: 0.7rem 1rem;
  font-family: 'Segoe UI', sans-serif;
}

.navbar-brand {
  font-weight: 600;
  font-size: 1.4rem;
}

.navbar-nav {
  display: flex;
  flex-wrap: wrap;
}

.nav-item {
  margin-right: 15px;
}

.nav-link {
  position: relative;
  color: #f8f9fa;
  transition: all 0.3s ease;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.nav-link:hover {
  color: #00bcd4;
}

.nav-link.active {
  color: #00bcd4;
  font-weight: 600;
}

.nav-link::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background: #00bcd4;
  bottom: 0;
  left: 0;
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.25s ease-out;
}

.nav-link:hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;
}

/* Seção Bovinos */
.nav-section-title {
  font-weight: bold;
  color: #ccc;
  margin: 0 1rem;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.nav-divider {
  width: 1px;
  height: 30px;
  background-color: rgba(255, 255, 255, 0.3);
  margin: 0 1rem;
}

/* Mobile */
@media (max-width: 991px) {
  .nav-item {
    margin: 0.5rem 0;
  }

  .navbar-collapse {
    justify-content: flex-start;
  }
}
</style>
