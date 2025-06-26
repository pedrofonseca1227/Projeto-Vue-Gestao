<template>
  <nav class="navbar navbar-expand-lg shadow-sm">
    <div class="container d-flex justify-content-between align-items-center">

      <!-- Logo -->
      <router-link to="/home" class="navbar-brand d-flex align-items-center">
        <img :src="require('@/assets/Logo.png')" alt="Logo" class="logo-img" />
      </router-link>

      <!-- Botão mobile -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Itens da navbar -->
      <div class="collapse navbar-collapse justify-content-center" id="navbarNav">
        <ul class="navbar-nav d-flex align-items-center gap-3">

          <!-- Dropdown de Seções -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              🔽 Seção: {{ secaoAtiva === 'bovinos' ? 'Bovinos' : 'Estoque' }}
            </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#" @click.prevent="selecionarSecao('estoque')">📦 Estoque</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="selecionarSecao('bovinos')">🐄 Bovinos</a></li>
            </ul>
          </li>

          <!-- Itens da seção ESTOQUE -->
          <template v-if="secaoAtiva === 'estoque'">
            <li class="nav-item">
              <router-link to="/produtos" class="nav-link" active-class="active">
                Produtos
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/relatorios" class="nav-link" active-class="active">
                Relatórios
              </router-link>
            </li>
          </template>

          <!-- Itens da seção BOVINOS -->
          <template v-else>
            <li class="nav-item">
              <router-link to="/contagemPasto" class="nav-link" active-class="active">
                Contagem Pasto
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/Confinamento" class="nav-link" active-class="active">
                Confinamento
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/vendaConfinamento" class="nav-link" active-class="active">
                Vendas Confinamento
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/registrarVenda" class="nav-link" active-class="active">
                Registro Vendas
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/cicloGastos" class="nav-link" active-class="active">
                Ciclo Gastos
              </router-link>
            </li>
          </template>

        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'NavbarComponent',
  setup() {
    const router = useRouter()
    const secaoAtiva = ref('bovinos')

    const selecionarSecao = (secao) => {
      secaoAtiva.value = secao
      if (secao === 'bovinos') {
        router.push('/home')
      }
    }

    return {
      secaoAtiva,
      selecionarSecao
    }
  }
}
</script>

<style scoped>
.navbar {
  background-color: #ffffff;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid #dee2e6;
}

.logo-img {
  height: 40px;
  width: auto;
}

.navbar-nav {
  align-items: center;
  flex-direction: row;
  gap: 1.5rem;
}

.nav-link {
  color: #004080;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.active {
  color: #007BFF;
  font-weight: 600;
}

.dropdown-menu {
  min-width: 160px;
}

.dropdown-item:hover {
  background-color: #f1f1f1;
}
</style>
