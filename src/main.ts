/*eslint-disable*/
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@/assets/styles/main.sass';
import { store } from './store';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';
import { mouse } from './directives/mouse';
import '@/plugins/vee-validate';
import { shortcut } from '@/features/shortcuts/directives/shortcut';
import { inputScope } from '@/directives/input-scope/directive';
import { contextMenu } from '@/directives/context-menu';

const app = createApp(App);

app.use(store)
    .use(router)
    .mount('#app');

app.directive('mouse', mouse);
app.directive('shortcut', shortcut);
app.directive('input-scope', inputScope);
app.directive('context-menu', contextMenu);
