import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Firebase Auth

// Importações das views
import LoginPage from '@/views/Auth/LoginPage.vue';
import HomePage from '@/views/Bovinos/HomePage.vue';
import ProductListPage from '@/views/Estoque/ProductListPage.vue';
import AddProduct from '@/views/Estoque/AddProduct.vue';
import RelatorioPage from '@/views/Estoque/RelatorioPage.vue';
import AdicionarPasto from '@/views/Bovinos/AdicionarPasto.vue';
import ContagemPasto from '@/views/Bovinos/ContagemPasto.vue';
import VendaConfinamento from '@/views/Bovinos/VendaConfinamento.vue';
import ConfinamentoPage from '@/views/Bovinos/ConfinamentoPage.vue';
import AdicionarConfinamento from '@/views/Bovinos/AdicionarConfinamento.vue';
import RegistrarVenda from '@/views/Bovinos/RegistrarVenda.vue';
import GastosTrimestrais from '@/views/Bovinos/CicloGastos.vue';
import StAndre from '@/views/StAndre/StAndre.vue';
import DashboardConfinamento from '@/views/Bovinos/DashboardConfinamento.vue';
import RelatoriosAnaliticos from '@/views/Bovinos/RelatoriosAnaliticos.vue';
import AdicionarPastoStAndre from '@/views/StAndre/AdicionarPastoStAndre.vue';

const routes = [
  { path: '/', name: 'Login', component: LoginPage },
  { path: '/home', name: 'Home', component: HomePage, meta: { requiresAuth: true } },
  { path: '/produtos', name: 'Produtos', component: ProductListPage, meta: { requiresAuth: true } },
  { path: '/adicionar-produto', name: 'AddProduto', component: AddProduct, meta: { requiresAuth: true } },
  { path: '/relatorios', name: 'Relatorios', component: RelatorioPage, meta: { requiresAuth: true } },
  { path: '/add-pasto', name: 'AdicionarPasto', component: AdicionarPasto, meta: { requiresAuth: true } },
  { path: '/contagemPasto', name: 'ContagemPasto', component: ContagemPasto, meta: { requiresAuth: true } },
  { path: '/vendaConfinamento', name: 'VendaConfinamento', component: VendaConfinamento, meta: { requiresAuth: true } },
  { path: '/confinamento', name: 'Confinamento', component: ConfinamentoPage, meta: { requiresAuth: true } },
  { path: '/adicionarConfinamento', name: 'AdicionarConfinamento', component: AdicionarConfinamento, meta: { requiresAuth: true } },
  { path: '/registrarVenda', name: 'RegistrarVenda', component: RegistrarVenda, meta: { requiresAuth: true } },
  { path: '/cicloGastos', name: 'CicloGastos', component: GastosTrimestrais, meta: { requiresAuth: true } },
  { path: '/StAndre', name: 'StAndre', component: StAndre, meta: { requiresAuth: true } },
  { path: '/dashboardConfinamento', name: 'DashboardConfinamento', component: DashboardConfinamento, meta: { requiresAuth: true } },
  { path: '/relatoriosAnaliticos', name: 'RelatoriosAnaliticos', component: RelatoriosAnaliticos, meta: { requiresAuth: true } },
  {path: '/adicionarPastoStAndre', name: 'AdicionarPastoStAndre', component: AdicionarPastoStAndre, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware para proteger rotas
router.beforeEach((to, from, next) => {
  const auth = getAuth();

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (!requiresAuth) {
    next();
    return;
  }

  // Verifica se o usuário está autenticado
  onAuthStateChanged(auth, user => {
    if (user) {
      next();
    } else {
      next('/'); // redireciona para login
    }
  });
});

export default router;
