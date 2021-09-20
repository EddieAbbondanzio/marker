import { generateId } from '@/store';
import { Notebook } from '@/features/notebooks/shared/notebook';
import { GlobalNavigationState, GlobalNavigationItem } from './state';
import { confirmDelete, confirmReplaceNotebook } from '@/shared/utils';
import { Actions, Context, Mutations } from 'vuex-smart-module';
import { GlobalNavigationGetters } from '@/features/ui/store/modules/global-navigation/getters';
import { GlobalNavigationMutations } from '@/features/ui/store/modules/global-navigation/mutations';
import { tags } from '@/features/tags/store';
import { notebooks } from '@/features/notebooks/store';
import { notes } from '@/features/notes/store';
import _ from 'lodash';
import { Store } from 'vuex';
import { undo, UndoModule } from '@/store/plugins/undo';

export class GlobalNavigationActions extends Actions<
    GlobalNavigationState,
    GlobalNavigationGetters,
    GlobalNavigationMutations,
    GlobalNavigationActions
> {
    contexts!: {
        tags: Context<typeof tags>;
        notebooks: Context<typeof notebooks>;
        notes: Context<typeof notes>;
    };

    undo!: UndoModule<GlobalNavigationMutations>;

    async $init(store: Store<any>) {
        this.contexts = {
            tags: tags.context(store),
            notebooks: notebooks.context(store),
            notes: notes.context(store)
        };

        this.undo = undo.getModule({ name: 'globalNavigation' });
    }

    setActive(a: GlobalNavigationItem) {
        // Stop if we're setting the same item active
        if (_.isEqual(this.state.active, a)) {
            return;
        }

        this.undo.sequence((commit) => commit('SET_ACTIVE', a));
    }

    toggleHighlighted() {
        this.undo.sequence((commit) => {
            let notebook;

            switch (this.state.highlight?.section) {
                case 'notebook':
                    if (this.state.highlight.id == null) {
                        commit('SET_NOTEBOOKS_EXPANDED', !this.state.notebooks.expanded);
                    } else {
                        notebook = this.contexts.notebooks.getters.byId(this.state.highlight.id)!;
                        if (notebook.children == null || notebook.children.length === 0) {
                            return;
                        }

                        commit(() =>
                            this.contexts.notebooks.commit('SET_EXPANDED', {
                                notebook,
                                expanded: !notebook.expanded,
                                bubbleUp: false
                            })
                        );
                    }
                    break;
                case 'tag':
                    if (this.state.highlight.id == null) {
                        this.commit('SET_TAGS_EXPANDED', { value: !this.state.tags.expanded });
                    }
                    break;
            }
        });
    }

    clearHighlight() {
        // this.commit('SET_HIGHLIGHT', { value: undefined! });
    }

    moveHighlightUp() {
        const next = this.getters.previousItem();

        if (!_.isEqual(this.state.highlight, next)) {
            // this.commit('SET_HIGHLIGHT', { value: next });
        }
    }

    moveHighlightDown() {
        const next = this.getters.nextItem();

        if (!_.isEqual(this.state.highlight, next)) {
            // this.commit('SET_HIGHLIGHT', { value: next });
        }
    }

    setWidth(width: string) {
        // this.commit('SET_WIDTH', { value: width, _undo: { ignore: true } });
    }

    setScrollPosition(scrollPos: number) {
        // this.commit('SET_SCROLL_POSITION', { value: scrollPos });
    }

    scrollUp(pixels = 30) {
        const value = Math.max(this.state.scrollPosition - pixels, 0);
        // this.commit('SET_SCROLL_POSITION', { value });
    }

    scrollDown(pixels = 30) {
        const value = Math.max(this.state.scrollPosition + pixels, 0);
        // this.commit('SET_SCROLL_POSITION', { value });
    }

    tagInputStart({ id }: { id?: string } = {}) {
        // Stop if we already have an input in progress.
        if (this.state.tags.input?.mode != null) {
            // return;
        }

        // this.undo.group((_undo) => {
        //     this.commit('SET_TAGS_EXPANDED', { value: true, _undo });

        //     if (id != null) {
        //         const tag = this.contexts.tags.getters.byId(id, { required: true });

        //         this.commit('START_TAGS_INPUT', { value: { id: tag?.id, value: tag?.name }, _undo });
        //     } else {
        //         this.commit('START_TAGS_INPUT', { value: undefined, _undo });
        //     }
        // });

        // this.undo.setRollbackPoint();
    }

    tagInputUpdated(value: string) {
        if (value === this.state.tags.input?.name) {
            // return;
        }

        // this.commit('SET_TAGS_INPUT', { value });
    }

    tagInputConfirm() {
        // this.undo.group((_undo) => {
        //     const input = this.state.tags.input;
        //     let existing: Tag;
        //     // this.contexts.tags.commit('CREATE', {
        //     //     value: { id: generateId(), name: input!.name },
        //     //     _undo: {
        //     //         undoCallback: (ctx) => ctx.replayMutation(),
        //     //         redoCallback: (ctx) => {
        //     //             ctx.replayMutation();
        //     //             this.commit('SET_TAGS_EXPANDED', true);
        //     //         }
        //     //     }
        //     // });
        //     this.commit('SET_TAGS_EXPANDED', true, {});
        //     switch (input?.mode) {
        //         case 'create':
        //             this.contexts.tags.commit('CREATE', {
        //                 value: { id: generateId(), name: input.name },
        //                 _undo: {
        //                     ..._undo,
        //                     undoCallback: (ctx) => {
        //                         this.contexts.tags.commit('DELETE', { value: ctx.value });
        //                         this.commit('SET_TAGS_EXPANDED', { value: true, _undo: { ignore: true } });
        //                     },
        //                     redoCallback: (ctx) => {
        //                         ctx.replayMutation();
        //                         this.commit('SET_TAGS_EXPANDED', { value: true, _undo: { ignore: true } });
        //                     }
        //                 }
        //             });
        //             break;
        //         case 'update':
        //             existing = this.contexts.tags.getters.byId(input.id, { required: true });
        //             this.contexts.tags.commit('SET_NAME', {
        //                 value: { tag: existing, newName: input.name },
        //                 _undo: {
        //                     ..._undo,
        //                     cache: { oldName: existing.name },
        //                     // We have to trigger callbacks on modules that aren't tracked by undo.
        //                     undoCallback: (m) => {
        //                         console.log(
        //                             'UNDO NAME. newName: ',
        //                             m.payload.value.newName,
        //                             ' old name: ',
        //                             m.payload._undo.cache.oldName
        //                         );
        //                         this.contexts.tags.commit('SET_NAME', {
        //                             value: { tag: m.payload.value.tag, newName: m.payload._undo.cache.oldName }
        //                         });
        //                         this.commit('SET_TAGS_EXPANDED', { value: true, _undo: { ignore: true } });
        //                     },
        //                     redoCallback: (m) => {
        //                         this.contexts.tags.commit('SET_NAME', {
        //                             value: { tag: m.payload.value.tag, newName: m.payload.value.newName }
        //                         });
        //                         this.commit('SET_TAGS_EXPANDED', { value: true, _undo: { ignore: true } });
        //                     }
        //                 }
        //             });
        //             break;
        //     }
        //     this.contexts.tags.commit('SORT', { _undo });
        //     this.commit('CLEAR_TAGS_INPUT', { _undo });
        // });
        // this.undo.releaseRollbackPoint();
    }

    tagInputCancel() {
        // this.undo.rollback();
        this.commit('CLEAR_TAGS_INPUT', { _undo: { ignore: true } });
    }

    async tagDelete(id: string) {
        const tag = this.contexts.tags.getters.byId(id, { required: true });

        if (await confirmDelete('tag', tag.name)) {
            // await this.undo.group(async (_undo) => {
            //     _undo.cache = { id, value: tag.name };
            //     this.contexts.tags.commit('DELETE', {
            //         value: tag,
            //         _undo: {
            //             ..._undo,
            //             undoCallback: (m) => {
            //                 this.contexts.tags.commit('CREATE', {
            //                     value: { id: m.payload._undo.cache.id, name: m.payload._undo.cache.value }
            //                 });
            //                 this.commit('SET_TAGS_EXPANDED', { value: true, _undo: { ignore: true } });
            //             },
            //             redoCallback: (m) => {
            //                 this.contexts.tags.commit('DELETE', {
            //                     value: m.payload._undo.cache.id
            //                 });
            //                 this.commit('SET_TAGS_EXPANDED', { value: true, _undo: { ignore: true } });
            //             }
            //         }
            //     });
            //     // Find out what notes had the tag so we can cache it.
            //     const notesWithTag = this.contexts.notes.getters.notesByTag(id);
            //     _undo.cache.noteIds = notesWithTag.map((n) => n.id);
            //     this.contexts.notes.commit('REMOVE_TAG', {
            //         value: { tagId: id },
            //         _undo: {
            //             ..._undo,
            //             undoCallback: (m) =>
            //                 this.contexts.notes.commit('ADD_TAG', {
            //                     value: { note: m.payload._undo.cache.noteIds, tagId: m.payload.value.tagId },
            //                     _undo: { ignore: true }
            //                 }),
            //             redoCallback: (m) =>
            //                 this.contexts.notes.commit('REMOVE_TAG', { value: m.payload.value, _undo: { ignore: true } })
            //         }
            //     });
            // });
        }
    }

    async tagDeleteAll() {
        if (await confirmDelete('every tag', '')) {
            //     await this.undo.group((_undo) => {
            //         // Cache off tags
            //         _undo.cache.tags = [];
            //         for (const tag of this.contexts.tags.state.values) {
            //             _undo.cache.tags.push({
            //                 id: tag.id,
            //                 value: tag.name,
            //                 noteIds: this.contexts.notes.getters.notesByTag(tag.id).map((n) => n.id)
            //             });
            //         }
            //         this.contexts.tags.commit('DELETE_ALL', {
            //             _undo: {
            //                 ..._undo,
            //                 undoCallback: (m) => {
            //                     for (const tag of _undo.cache.tags) {
            //                         this.contexts.tags.commit('CREATE', {
            //                             value: { id: tag.id, name: tag.value },
            //                             _undo: { ignore: true }
            //                         });
            //                         this.contexts.notes.commit('ADD_TAG', {
            //                             value: { note: tag.noteIds, tagId: tag.id },
            //                             _undo: { ignore: true }
            //                         });
            //                     }
            //                 },
            //                 redoCallback: (m) => {
            //                     this.contexts.tags.commit('DELETE_ALL', { _undo: { ignore: true } });
            //                 }
            //             }
            //         });
            //     });
        }
    }

    setTagsExpanded(expanded: boolean) {
        // this.commit('SET_TAGS_EXPANDED', { value: expanded });
    }

    notebookInputStart({ id, parentId }: { id?: string; parentId?: string } = {}) {
        // Stop if we already have an input in progress.
        if (this.state.notebooks.input?.mode != null) {
            return;
        }

        let notebook: Notebook | undefined;
        let parent: Notebook | undefined;

        /*
         * id != null -> update
         * id == null -> create, check if we put it under root, or a parent (parentId != null)
         */

        if (id != null) {
            notebook = this.contexts.notebooks.getters.byId(id);
            if (notebook == null) throw Error(`No notebook with id ${id} found.`);
        }

        if (id == null && parentId != null) {
            parent = this.contexts.notebooks.getters.byId(parentId);
        }

        const p: any = {
            type: 'notebookInputStarted',
            parentId: parent?.id
        };

        if (notebook != null) {
            p.notebook = {
                id: notebook.id,
                value: notebook.name
            };
        }

        const _undo = { ignore: true };

        // this.commit('START_NOTEBOOKS_INPUT', { value: p, _undo });
        // this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });

        if (parent != null) {
            this.contexts.notebooks.commit('SET_EXPANDED', {
                value: { notebook: parent, bubbleUp: true, expanded: true },
                _undo
            });
        }
    }

    notebookInputUpdated(value: string) {
        if (value === this.state.notebooks.input?.name) {
            // return;
        }

        // this.commit('SET_NOTEBOOKS_INPUT', { value, _undo: { ignore: true } });
    }

    notebookInputConfirm() {
        // this.undo.group((_undo) => {
        //     const input = this.state.notebooks.input!;
        //     let notebook: NotebookCreate;
        //     let old: Notebook | undefined;
        //     switch (this.state.notebooks.input?.mode) {
        //         case 'create':
        //             notebook = {
        //                 id: generateId(),
        //                 name: input.name,
        //                 expanded: false
        //             };
        //             if (input.parentId != null) {
        //                 notebook.parent = this.contexts.notebooks.getters.byId(input.parentId, { required: true });
        //             }
        //             this.contexts.notebooks.commit('CREATE', {
        //                 value: notebook,
        //                 _undo: {
        //                     ..._undo,
        //                     undoCallback: (m) => {
        //                         this.contexts.notebooks.commit('DELETE', {
        //                             value: m.payload.value,
        //                             _undo: { ignore: true }
        //                         });
        //                         this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });
        //                     },
        //                     redoCallback: (m) => {
        //                         this.contexts.notebooks.commit('CREATE', m.payload);
        //                         this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });
        //                     }
        //                 }
        //             });
        //             break;
        //         case 'update':
        //             old = this.contexts.notebooks.getters.byId(input.id!)!;
        //             this.contexts.notebooks.commit('SET_NAME', {
        //                 value: { notebook: old, newName: input.name },
        //                 _undo: {
        //                     ..._undo,
        //                     cache: {
        //                         oldName: old.name
        //                     },
        //                     undoCallback: (m) => {
        //                         this.contexts.notebooks.commit('SET_NAME', {
        //                             value: {
        //                                 notebook: m.payload.value.notebook,
        //                                 newName: m.payload._undo.cache.oldName
        //                             }
        //                         });
        //                         this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });
        //                     },
        //                     redoCallback: (m) => {
        //                         this.contexts.notebooks.commit('SET_NAME', {
        //                             value: { notebook: m.payload.value.notebook, newName: m.payload.value.newName }
        //                         });
        //                         this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });
        //                     }
        //                 }
        //             });
        //             break;
        //         default:
        //             throw Error(`Invalid notebook input mode ${this.state.notebooks.input?.mode}`);
        //     }
        //     _undo.ignore = true;
        //     this.commit('CLEAR_NOTEBOOKS_INPUT', { _undo });
        //     this.contexts.notebooks.commit('SORT', { _undo });
        // });
    }

    notebookInputCancel() {
        this.commit('CLEAR_NOTEBOOKS_INPUT', { _undo: { ignore: true } });
    }

    async notebookDelete(id: string) {
        const notebook = this.contexts.notebooks.getters.byId(id, { required: true });

        if (await confirmDelete('notebook', notebook.name)) {
            // this.undo.group((_undo) => {
            // _undo.cache = {
            //     id: notebook.id,
            //     value: notebook.name,
            //     parent: notebook.parent,
            //     children: notebook.children
            // };

            // this.contexts.notebooks.commit('DELETE', {
            //     value: notebook,
            //     _undo: {
            //         ..._undo,
            //         cache: {
            //             notebook: notebook
            //         },
            //         undoCallback: (m) => {
            //             this.contexts.notebooks.commit('CREATE', {
            //                 value: m.payload._undo.cache.notebook,
            //                 _undo: { ignore: true }
            //             });
            //             this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });
            //         },
            //         redoCallback: (m) => {
            //             this.contexts.notebooks.commit('DELETE', m.payload);
            //             this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });
            //         }
            //     }
            // });

            // Find out what notebooks had the tag so we can cache it.
            const notesWithNotebook = this.contexts.notes.getters.notesByNotebook(id);
            // _undo.cache.noteIds = notesWithNotebook.map((n) => n.id);

            // this.contexts.notes.commit('REMOVE_NOTEBOOK', {
            //     value: { notebookId: id },
            //     _undo: {
            //         ..._undo,
            //         undoCallback: (m) => {
            //             throw Error('fix');
            //         },
            //         // this.contexts.notes.commit('ADD_NOTEBOOK', {
            //         //     value: { noteId: m.payload._undo.cache.noteIds, notebookId: m.payload.value.tagId },
            //         //     _undo: { ignore: true }
            //         // }),,
            //         redoCallback: (m) =>
            //             this.contexts.notes.commit('REMOVE_NOTEBOOK', { value: m.payload.value, _undo: { ignore: true } })
            //     }
            // });
            // });
        }
    }

    async notebookDeleteAll() {
        if (await confirmDelete('every notebook', '')) {
            // await this.undo.group((_undo) => {
            //     // Cache off notebooks
            //     _undo.cache.notebooks = [];
            //     for (const notebook of this.contexts.notebooks.getters.flatten) {
            //         _undo.cache.notebooks.push({
            //             id: notebook.id,
            //             value: notebook.name,
            //             noteIds: this.contexts.notes.getters.notesByNotebook(notebook.id).map((n) => n.id)
            //         });
            //     }
            //     // this.contexts.notebooks.commit('DELETE_ALL', {
            //     //     _undo: {
            //     //         ..._undo,
            //     //         undoCallback: (m) => {
            //     //             for (const notebook of _undo.cache.notebooks) {
            //     //                 this.contexts.notebooks.commit('CREATE', {
            //     //                     value: { id: notebook.id, name: notebook.value },
            //     //                     _undo: { ignore: true }
            //     //                 });
            //     //                 throw Error('fix');
            //     //                 // this.contexts.notes.commit('ADD_NOTEBOOK', {
            //     //                 //     value: { noteId: notebook.noteIds, notebookId: notebook.id },
            //     //                 //     _undo: { ignore: true }
            //     //                 // });
            //     //             }
            //     //         },
            //     //         redoCallback: (m) => {
            //     //             this.contexts.notebooks.commit('DELETE_ALL', { _undo: { ignore: true } });
            //     //         }
            //     //     }
            //     // });
            // });
        }
    }

    setNotebooksExpanded(expanded: boolean) {
        // this.commit('SET_NOTEBOOKS_EXPANDED', { value: expanded });
    }

    notebookDragStart(notebook: Notebook) {
        // this.commit('SET_NOTEBOOKS_DRAGGING', { value: notebook.id });
    }

    async notebookDragStop(endedOnId: string | null) {
        const dragging = this.contexts.notebooks.getters.byId(this.state.notebooks.dragging!);

        if (dragging == null) {
            throw new Error('No drag to finalize.');
        }

        let endedOn;
        if (endedOnId != null) {
            endedOn = this.contexts.notebooks.getters.byId(endedOnId, { notebooks: dragging.children });
        }

        /*
         * Don't allow a move if we started and stopped on the same element, or if
         * we are attempting to move a parent to a child of it.
         */
        if (dragging.id !== endedOnId && endedOn == null) {
            // Remove from old location
            this.contexts.notebooks.commit('DELETE', { value: dragging });

            let parent: Notebook | undefined;

            if (endedOnId != null) {
                parent = this.contexts.notebooks.getters.byId(endedOnId);
            }

            /*
             * Check for a notebook with the same name in the new destination. If one exists,
             * we'll need to verify with the user that they want to replace it.
             */
            const newSiblings =
                endedOnId == null
                    ? this.contexts.notebooks.state.values
                    : this.contexts.notebooks.getters.byId(endedOnId)?.children ?? [];

            const duplicate = newSiblings.find((n) => n.name === dragging.name)!;
            if (duplicate != null) {
                const confirmReplace = await confirmReplaceNotebook(dragging.name);

                if (confirmReplace) {
                    this.contexts.notebooks.commit('DELETE', { value: duplicate });
                }
            }

            // Insert into new spot
            this.contexts.notebooks.commit('CREATE', {
                value: {
                    id: dragging.id,
                    name: dragging.name,
                    parent,
                    children: dragging.children,
                    expanded: dragging.expanded
                }
            });

            if (parent) {
                this.contexts.notebooks.commit('SET_EXPANDED', {
                    value: { notebook: parent, expanded: true, bubbleUp: true }
                });
            }

            this.commit('CLEAR_NOTEBOOKS_DRAGGING', {});

            this.contexts.notebooks.commit('SORT', {});
        }
    }

    notebookDragCancel() {
        this.commit('CLEAR_NOTEBOOKS_DRAGGING', {});
    }

    expandAll() {
        // this.commit('SET_TAGS_EXPANDED', { value: true });
        // this.commit('SET_NOTEBOOKS_EXPANDED', { value: true });

        this.contexts.notebooks.commit('SET_ALL_EXPANDED', { value: { expanded: false } });
    }

    collapseAll() {
        // this.commit('SET_TAGS_EXPANDED', { value: false });
        // this.commit('SET_NOTEBOOKS_EXPANDED', { value: false });

        this.contexts.notebooks.commit('SET_ALL_EXPANDED', { value: { expanded: false } });
    }

    async emptyTrash() {
        if (await confirmDelete('the trash', 'permanently')) {
            this.contexts.notes.commit('EMPTY_TRASH', {});
        }
    }
}
