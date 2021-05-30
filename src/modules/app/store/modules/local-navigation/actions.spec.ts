import { actions } from '@/modules/app/store/modules/local-navigation/actions';

describe('LocalNavigation Actions', () => {
    describe('setActive', () => {
        it('passes newValue and oldValue', () => {
            const state = {
                active: '2'
            };

            const commit = jest.fn();
            (actions as any).setActive({ commit, state }, '1');

            expect(commit.mock.calls[0][1].newValue).toBe('1');
            expect(commit.mock.calls[0][1].oldValue).toBe('2');
        });
    });

    describe('noteInputStart', () => {
        it('throws if note not found', () => {
            expect(() => {
                (actions as any).noteInputStart({ id: '1' });
            }).toThrow();
        });

        it('sets active and note', () => {
            const commit = jest.fn();

            const rootState = {
                app: {
                    globalNavigation: {
                        active: {
                            id: '1',
                            type: 'notebook'
                        }
                    }
                },
                notes: {
                    values: [{ id: '1', value: 'cat' }]
                }
            };

            (actions as any).noteInputStart({ commit, rootState }, { id: '1' });

            expect(commit.mock.calls[0][1].active.id).toBe('1');
            expect(commit.mock.calls[0][1].note.id).toBe('1');
        });
    });

    describe('noteInputUpdate', () => {
        it('sets new value and old value', () => {
            const commit = jest.fn();
            const state = {
                notes: {
                    input: {
                        name: 'horse'
                    }
                }
            };

            (actions as any).noteInputUpdate(
                {
                    commit,
                    state
                },
                'dog'
            );

            expect(commit.mock.calls[0][1].oldValue).toBe('horse');
            expect(commit.mock.calls[0][1].newValue).toBe('dog');
        });
    });

    describe('noteInputConfirm', () => {
        it('it commits create on create', () => {
            const commit = jest.fn();

            (actions as any).noteInputConfirm({
                commit,
                state: {
                    notes: {
                        input: {
                            mode: 'create'
                        }
                    }
                }
            });

            expect(commit.mock.calls[0][0]).toBe('notes/CREATE');
        });

        it('commits update on update', () => {
            const commit = jest.fn();

            (actions as any).noteInputConfirm({
                commit,
                state: {
                    notes: {
                        input: {
                            mode: 'update'
                        }
                    }
                }
            });

            expect(commit.mock.calls[0][0]).toBe('notes/NAME');
        });
    });

    describe('noteInputCancel', () => {
        it('passes old value', () => {
            const commit = jest.fn();

            (actions as any).noteInputCancel({
                commit,
                state: {
                    notes: {
                        input: {
                            name: 'cat'
                        }
                    }
                }
            });

            expect(commit.mock.calls[0][1].type).toBe('noteInputCleared');
        });
    });

    describe('widthUpdated', () => {
        it('passes newValue and oldValue', async () => {
            const commit = jest.fn();
            const state = {
                width: '1'
            };

            await (actions as any).widthUpdated(
                {
                    commit,
                    state
                },
                '2'
            );

            expect(commit.mock.calls[0][1]).toHaveProperty('newValue', '2');
        });
    });
});
