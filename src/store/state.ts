import { ShortcutState } from '@/features/shortcuts/store/state';
import { UserInterface } from '../features/ui/store/state';
import { NotebookState } from '../features/notebooks/store/state';
import { NoteState } from '../features/notes/store/state';
import { TagState } from '../features/tags/store/state';

export interface State {
    ui: UserInterface;
    tags: TagState;
    notebooks: NotebookState;
    notes: NoteState;
    shortcuts: ShortcutState;
}

export const state = {};
