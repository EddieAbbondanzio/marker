import { isBlank } from '@/shared/utils';
import { Directive, DirectiveBinding } from 'vue';

export const CONTEXT_MENU_ATTRIBUTE = 'data-contenxt-menu';

export const contextMenu: Directive = {
    mounted(el: HTMLElement, b: DirectiveBinding) {
        const name = b.arg;

        if (name == null || isBlank(name)) throw Error('Context menu name is required');

        el.setAttribute(CONTEXT_MENU_ATTRIBUTE, name);
    }
};