import { Note } from '@/store/modules/notes/state';

export interface LocalNavigation {
    width: string;
    notes: {
        input: Partial<Note> & { mode?: 'create' | 'update' };
    };
}

export const state: LocalNavigation = {
    width: '200px',
    notes: {
        input: {}
    }
};