import { DEFAULT_SHORTCUTS, ShortcutState, state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { persist } from '@/store/plugins/persist/persist';
import { shortcut, Shortcut, shortcutFromString } from '@/directives/shortcut';

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};

persist.register({
    namespace: 'shortcuts',
    initMutation: 'INIT',
    transformer,
    reviver
});

export function transformer(state: ShortcutState): any {
    return {
        values: state.values.filter((s) => s.isUserDefined).map((s) => ({ name: s.name, keys: s.toString() }))
    };
}

export function reviver(state: { values: { name: string; keys: string }[] }): ShortcutState {
    const shortcuts = state.values.map((s) => shortcutFromString(s.name, s.keys, true));

    // Check if any default shortcuts were overrided.
    for (const defaultSC of DEFAULT_SHORTCUTS) {
        const overridedSC = shortcuts.find((s) => s.name === defaultSC.name);
        shortcuts.push(overridedSC ?? defaultSC);
    }

    // TODO: Add support for custom shortcuts that the user creates, and don't have defaults.

    return {
        values: shortcuts
    };
}