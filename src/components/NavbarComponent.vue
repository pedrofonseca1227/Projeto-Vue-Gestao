<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
    <div class="container px-3">
      <!-- Logo -->
      <router-link to="/home" class="navbar-brand d-flex align-items-center">
        <img :src="require('@/assets/Logo.png')" alt="Logo" class="logo-img me-2" />
      </router-link>

      <!-- Botão Menu Mobile -->
      <button class="navbar-toggler" type="button" @click="toggleMenu">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Menu -->
      <div class="collapse navbar-collapse" :class="{ show: menuAberto }">
        <ul
          class="navbar-nav w-100 flex-column flex-lg-row align-items-start align-items-lg-center gap-2 gap-lg-3"
        >
          <!-- Dropdown Seção -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              🔽 Seção:
              {{
                secaoAtiva === 'bovinos'
                  ? 'Bovinos'
                  : secaoAtiva === 'estoque'
                  ? 'Estoque'
                  : secaoAtiva === 'standre'
                  ? 'St André'
                  : ''
              }}
            </a>
            <ul class="dropdown-menu">
              <li>
                <a class="dropdown-item" href="#" @click.prevent="selecionarSecao('estoque')">
                  📦 Estoque
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="selecionarSecao('bovinos')">
                  🐄 Bovinos
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="selecionarSecao('standre')">
                  🐴 St André
                </a>
              </li>
            </ul>
          </li>

          <!-- ESTOQUE -->
          <template v-if="secaoAtiva === 'estoque'">
            <li class="nav-item">
              <router-link to="/produtos" class="nav-link" @click="fecharMenu">Produtos</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/relatorios" class="nav-link" @click="fecharMenu">Relatórios</router-link>
            </li>
          </template>

          <!-- BOVINOS -->
          <template v-else-if="secaoAtiva === 'bovinos'">
            <!-- Contagem -->
            <li class="nav-item">
              <router-link to="/contagemPasto" class="nav-link" @click="fecharMenu">
                Contagem
              </router-link>
            </li>

            <!-- Dropdown Confinamento -->
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                Confinamento
              </a>
              <ul class="dropdown-menu">
                <li>
                  <router-link to="/Confinamento" class="dropdown-item" @click="fecharMenu">
                    Cadastro de Lotes
                  </router-link>
                </li>
                <li>
                  <router-link to="/movimentacaoLote" class="dropdown-item" @click="fecharMenu">
                    Movimentação de Lotes
                  </router-link>
                </li>
                <li>
                  <router-link to="/historicoMovimentacao" class="dropdown-item" @click="fecharMenu">
                    Histórico de Movimentações
                  </router-link>
                </li>
              </ul>
            </li>

            <!-- Dropdown Vendas -->
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                Vendas
              </a>
              <ul class="dropdown-menu">
                <li>
                  <router-link to="/vendaConfinamento" class="dropdown-item" @click="fecharMenu">
                    Vendas Confinamento
                  </router-link>
                </li>
                <li>
                  <router-link to="/registrarVenda" class="dropdown-item" @click="fecharMenu">
                    Registrar Venda
                  </router-link>
                </li>
              </ul>
            </li>

            <!-- Dropdown Mais -->
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                Mais
              </a>
              <ul class="dropdown-menu">
                <li>
                  <router-link to="/cicloGastos" class="dropdown-item" @click="fecharMenu">
                    Ciclo de Gastos
                  </router-link>
                </li>
                <li>
                  <router-link to="/relatoriosAnaliticos" class="dropdown-item" @click="fecharMenu">
                    Relatórios
                  </router-link>
                </li>
              </ul>
            </li>

            <!-- Dashboard -->
            <li class="nav-item">
              <router-link to="/dashboardConfinamento" class="nav-link" @click="fecharMenu">
                Dashboard
              </router-link>
            </li>
          </template>

          <!-- ST ANDRE -->
          <template v-else-if="secaoAtiva === 'standre'">
            <li class="nav-item">
              <router-link to="/StAndre" class="nav-link" @click="fecharMenu">St André</router-link>
            </li>
          </template>
        </ul>

        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <button class="btn btn-danger btn-sm" @click="handleLogout">
              <i class="fas fa-sign-out-alt"></i> Sair
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { auth } from '@/firebase/firebase'

export default {
  name: 'NavbarComponent',
  setup() {
    const router = useRouter()
    const secaoAtiva = ref('bovinos')
    const menuAberto = ref(false)

    const selecionarSecao = (secao) => {
      secaoAtiva.value = secao
      menuAberto.value = false

      if (secao === 'bovinos') router.push('/home')
      if (secao === 'estoque') router.push('/produtos')
      if (secao === 'standre') router.push('/StAndre')
    }

    const toggleMenu = () => {
      menuAberto.value = !menuAberto.value
    }

    const fecharMenu = () => {
      menuAberto.value = false
    }

    const handleLogout = async () => {
      try {
        await signOut(auth)
        router.push('/')
      } catch (error) {
        console.error('Erro ao fazer logout:', error.code)
        alert('Ocorreu um erro ao sair. Tente novamente.')
      }
    }

    return {
      secaoAtiva,
      selecionarSecao,
      menuAberto,
      toggleMenu,
      fecharMenu,
      handleLogout
    }
  }
}
</script>

<style scoped>
.navbar {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid #dee2e6;
  z-index: 1030;
}

.logo-img {
  height: 40px;
  width: auto;
}

.nav-link {
  color: #004080;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active,
.nav-link.active {
  color: #007bff;
  font-weight: 600;
}

.dropdown-menu {
  min-width: 220px;
  border-radius: 10px;
  border: 1px solid #dee2e6;
  padding: 0.5rem 0;
}

.dropdown-item {
  padding: 0.55rem 1rem;
  font-weight: 500;
}

.dropdown-item:hover {
  background-color: #f1f6fb;
  color: #004080;
}

.btn-danger {
  font-weight: 500;
}

@media (max-width: 991px) {
  .navbar-nav {
    width: 100%;
    text-align: left;
  }

  .nav-link {
    width: 100%;
    padding: 0.6rem 1rem;
  }

  .dropdown-menu {
    width: 100%;
    text-align: left;
    border: none;
    box-shadow: none;
    background: #f8f9fa;
  }

  .navbar-nav:last-child {
    margin-top: 1rem;
  }
}
</style>