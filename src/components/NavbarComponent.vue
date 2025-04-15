<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Estoque Almoxarifado</a>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse justify-content-center" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link to="/produtos" class="nav-link" active-class="active">
              <i class="fa fa-cogs"></i> Produtos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/adicionar-produto" class="nav-link" active-class="active">
              <i class="fa fa-plus"></i> Adicionar Produto
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/relatorios" class="nav-link" active-class="active">
              <i class="fa fa-file-alt"></i> Relatórios de Movimentação
            </router-link>
          </li>

          <!-- Separação lógica -->
          <li class="nav-item nav-title">
            <span class="nav-title">Bovinos</span>
          </li>
          <li class="nav-item">
            <router-link to="/contagem" class="nav-link" active-class="active">
              <i class="fa fa-file-alt"></i> Contagem Animais
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/add-gado" class="nav-link" active-class="active">
              <i class="fa fa-plus-circle"></i> Adicionar Gado
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding-top: 10px;
  padding-bottom: 10px;
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
}

.navbar-collapse {
  display: flex;
  justify-content: center;
  width: 100%;
}

.navbar-nav {
  display: flex;
  justify-content: center;
  width: 100%;
  flex-wrap: wrap;
}

.nav-item {
  margin-right: 15px;
}

.nav-link {
  position: relative;
  transition: color 0.3s ease, padding-left 0.3s ease;
  padding-left: 20px;
}

.nav-link:hover {
  color: #4285c4;
}

.nav-link.active {
  color: #4285c4;
  font-weight: bold;
}

.nav-link::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: #4285c4;
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

.nav-title {
  color: #fff;
  font-weight: bold;
  padding: 0 1rem;
  display: flex;
  align-items: center;
}

@media (max-width: 991px) {
  .nav-item {
    margin-right: 10px;
  }
}

@media (max-width: 767px) {
  .navbar-collapse {
    display: flex;
    justify-content: center;
  }

  .navbar-nav {
    width: 100%;
    justify-content: center;
  }
}
</style>
