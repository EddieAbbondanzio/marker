import LocalNavigation from '@/components/LocalNavigation.vue';
import { AppState } from '@/store/modules/app/state';
import { mount } from '@vue/test-utils';
import { ActionTree, createStore, MutationTree, Store } from 'vuex';

describe('localNavigation.vue', () => {
    let mutations: MutationTree<any>;
    let actions: ActionTree<any, any>;
    let state: AppState;
    let store: Store<any>;

    beforeEach(() => {
        mutations = {
            update: jest.fn()
        };

        actions = {
            saveState: jest.fn()
        };

        state = {
            'window.localNavigation.width': '100px'
        } as any;

        store = createStore({
            modules: {
                app: {
                    namespaced: true,
                    mutations,
                    actions,
                    state
                }
            }
        });
    });

    it('triggers save on resizeStop', async () => {
        const wrapper = mount(LocalNavigation, {
            global: {
                plugins: [store]
            }
        });

        await wrapper.find('.resizable-handle').trigger('mousedown');
        document.dispatchEvent(new MouseEvent('mouseup'));

        expect(actions.saveState).toBeCalled();
    });
});