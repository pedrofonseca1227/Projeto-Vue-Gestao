import { createApp } from 'vue';
import App from './App.vue';
import router from './router';  // Importe o router que acabamos de configurar
import 'bootstrap/dist/css/bootstrap.min.css';


createApp(App)
  .use(router)  // Registre o Vue Router
  .mount('#app');
