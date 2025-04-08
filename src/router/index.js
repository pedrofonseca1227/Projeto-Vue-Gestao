import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/views/LoginPage.vue';
import ProductListPage from '@/views/ProductListPage.vue';
import AddProduct from '@/components/AddProduct.vue';
import ReportsPage from '@/views/ReportsPage.vue';
import EditProduct from '@/components/EditProduct.vue';  // Importe o EditProduct

const routes = [
  { path: '/', component: LoginPage },
  { path: '/produtos', component: ProductListPage },
  { path: '/adicionar-produto', component: AddProduct },
  { path: '/relatorios', component: ReportsPage },
  { path: '/editar-produto/:id', component: EditProduct }, // Rota para edição de produto
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Proteção de rota: Redirecionar para login se o usuário não estiver autenticado
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  if (to.path !== '/' && !isAuthenticated) {
    next('/');  // Redireciona para a página de login se não estiver autenticado
  } else {
    next();  // Permite o acesso à rota
  }
});

export default router;
