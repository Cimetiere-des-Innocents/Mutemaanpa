import '@/assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PreviewApp from '@/PreviewApp.vue';
import { router } from '@/router';

const app = createApp(PreviewApp);

app.use(createPinia());
app.use(router);

app.mount('#app');
