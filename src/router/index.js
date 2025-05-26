import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/views/LoginPage.vue';
import HomePage from '@/views/HomePage.vue';
import ProductListPage from '@/views/ProductListPage.vue';
import AddProduct from '@/components/AddProduct.vue';
import ReportsPage from '@/views/ReportsPage.vue';
import EditProduct from '@/components/EditProduct.vue';
import AdicionarPasto from '@/views/AdicionarPasto.vue';
import ContagemPasto from '@/views/ContagemPasto.vue';

const routes = [
  { path: '/', component: LoginPage },
  { path: '/home', component: HomePage },
  { path: '/produtos', component: ProductListPage },
  { path: '/adicionar-produto', component: AddProduct },
  { path: '/relatorios', component: ReportsPage },
  { path: '/editar-produto/:id', component: EditProduct },
  { path: '/add-pasto', component: AdicionarPasto },
  { path: '/contagemPasto', component: ContagemPasto },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  if (to.path !== '/' && !isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
