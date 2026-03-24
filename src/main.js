import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import MoneyInput from '@/components/MoneyInput.vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

const app = createApp(App);

app.component('MoneyInput', MoneyInput);
app.use(router);

app.mount('#app');