import { generateId } from '@/core/store/entity';
import { MutationTree } from 'vuex';
import { AppState } from './state';

export const mutations: MutationTree<AppState> = {
    INIT(state, s: AppState) {
        Object.assign(state, s);
    },
    FOCUSED(state, name?: 'editor' | 'globalNavigation' | 'localNavigation') {
        state.focused = name;
    },
    SET_CURSOR_ICON(state, icon: string) {
        state.cursor.icon = icon;
    },
    RESET_CURSOR_ICON(state) {
        state.cursor.icon = 'pointer';
    },
    CURSOR_DRAGGING(state, dragging) {
        state.cursor.dragging = dragging;
    }
};