import { createStore } from 'vuex';
import config from '@/store/modules/config/config';
import app from '@/store/modules/app';
import tags from '@/store/modules/tags';
import notebooks from '@/store/modules/notebooks';
import { PersistPlugin } from './plugins/persist/persist-plugin';
import { State } from './state';
import { mutations } from '@/store/mutations';
import { actions } from '@/store/actions';

export const store = createStore<State>({
    state: {} as any,
    mutations,
    actions,
    modules: {
        app,
        config,
        notebooks,
        tags
    },
    plugins: [PersistPlugin],
    /*
     * Don't use strict mode in production.
     * Major performance hit.
     * See: https://next.vuex.vuejs.org/guide/strict.html#development-vs-production
     */
    strict: process.env.NODE_ENV !== 'production'
});
