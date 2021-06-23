/*eslint-disable*/
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@/assets/styles/main.sass';
import { store } from './store';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';
import { mouse } from './common/directives/mouse';
import '@/plugins/vee-validate';
import { shortcut, shortcutManager } from '@/modules/shortcuts/directives/shortcut';
import { focusable } from '@/common/directives/focusable';

const app = createApp(App);

app.use(store)
    .use(router)
    .mount('#app');

app.directive('mouse', mouse);
app.directive('shortcut', shortcut);
app.directive('focusable', focusable);

shortcutManager.subscribe('editorToggleSplitView', () => store.commit('app/editor/TOGGLE_SPLIT_VIEW'));
