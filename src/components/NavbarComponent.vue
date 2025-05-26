<template>
  <nav class="navbar navbar-expand-lg shadow-sm">
    <div class="container-fluid">

      <!-- Logo -->
      <router-link to="/" class="navbar-brand d-flex align-items-center">
        <img src="@/assets/Logo.png" alt="Logo" class="logo-img me-2" />
      </router-link>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav align-items-center">

          <!-- Produtos e Relatórios -->
          <li class="nav-item">
            <router-link to="/home" class="nav-link" active-class="active">
              <i class="fa fa-home me-1"></i> Home
            </router-link>
          </li>

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

          <!-- Divisor -->
          <li class="nav-divider"></li>

          <!-- Bovinos -->
          <li class="nav-section-title">
            <i class="fa fa-cow me-1"></i> Bovinos
          </li>
          <li class="nav-item">
            <router-link to="/contagemPasto" class="nav-link" active-class="active">
              <i class="fa fa-list me-1"></i> Contagem Pasto
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
  background-color: #ffffff;
  padding: 0.7rem 1rem;
  font-family: 'Segoe UI', sans-serif;
  border-bottom: 1px solid #dee2e6;
}

.container-fluid {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  font-weight: 600;
  font-size: 1.3rem;
  color: #004080;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.logo-img {
  height: 40px;
  width: auto;
}

.navbar-collapse {
  display: flex !important;
  justify-content: center;
  align-items: center;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.nav-item {
  display: flex;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  position: relative;
  color: #004080;
  transition: all 0.3s ease;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.nav-link:hover {
  color: #007BFF;
}

.nav-link.active {
  color: #007BFF;
  font-weight: 600;
}

.nav-link::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background: #007BFF;
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

.nav-section-title {
  font-weight: bold;
  color: #6c757d;
  margin: 0 1rem;
  text-transform: uppercase;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
}

.nav-divider {
  width: 1px;
  height: 30px;
  background-color: #ccc;
  margin: 0 1rem;
  align-self: center;
}

@media (max-width: 991px) {
  .navbar-collapse {
    flex-direction: column;
    align-items: flex-start;
  }

  .nav-item {
    margin: 0.5rem 0;
  }

  .logo-img {
    height: 35px;
  }
}

</style>
