import { createApp } from 'vue';
import App from './App.vue';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';

import * as BootstrapVueNext from 'bootstrap-vue-next';

const app = createApp(App);

// Registrar todos os componentes do BootstrapVue Next globalmente
for (const component in BootstrapVueNext) {
  app.component(component, BootstrapVueNext[component]);
}

app.mount('#app');
