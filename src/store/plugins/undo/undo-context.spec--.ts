import { UndoItemOrGroup } from '@/store/plugins/undo/types';
import { UndoContext } from '@/store/plugins/undo/undo-context';
import { UndoHistory } from '@/store/plugins/undo/undo-history';
import { UndoStateCache } from '@/store/plugins/undo/undo-state-cache';
import { MutationPayload, Store } from 'vuex';

describe('UndoContext', () => {
    describe('push()', () => {
        it('adds calls push() on history', () => {
            const getStore = () => ({} as Store<any>);

            const undoModule = new UndoContext({}, getStore, {
                name: 'foo',
                namespace: 'foo',
                setStateMutation: 'SET_STATE',
                stateCacheInterval: 10
            });

            const spy = jest.spyOn(UndoHistory.prototype as any, 'push');

            undoModule.push({ type: 'a', payload: {} });
            expect(spy).toBeCalled();
        });

        it('caches state if needed', () => {
            const store = { state: {} } as Store<any>;
            const getStore = () => store;

            const undoModule = new UndoContext({ foo: 1 }, getStore, {
                name: 'foo',
                namespace: 'foo',
                setStateMutation: 'SET_STATE',
                stateCacheInterval: 1
            });

            undoModule.push({ type: 'a', payload: {} });
            expect(undoModule['_stateCache'].getLast(1).state.foo).toBe(1);

            // Make sure it's a deep copy.
            store.state.foo = 2;
            expect(undoModule['_stateCache'].getLast(1).state.foo).toBe(1);
        });
    });

    describe('canUndo()', () => {
        it('calls rewind() on history', () => {
            const getStore = () => ({ commit: (...args: any) => 1 as any } as Store<any>);

            const undoModule = new UndoContext({}, getStore, {
                name: 'foo',
                namespace: 'foo',
                setStateMutation: 'SET_STATE',
                stateCacheInterval: 10
            });

            undoModule.push({ type: 'a', payload: {} });

            const spy = jest.spyOn(UndoHistory.prototype as any, 'canUndo');
            undoModule.undo();
            expect(spy).toBeCalled();
        });
    });

    describe('canRedo()', () => {
        it('calls canRedo() on history', () => {
            const getStore = () => ({ commit: jest.fn() as any } as Store<any>);

            const undoModule = new UndoContext({}, getStore, {
                name: 'foo',
                namespace: 'foo',
                setStateMutation: 'SET_STATE',
                stateCacheInterval: 10
            });

            undoModule.push({ type: 'a', payload: {} });
            undoModule['_history']['_currentIndex'] = 0;

            const spy = jest.spyOn(UndoHistory.prototype as any, 'canRedo');
            undoModule.redo();
            expect(spy).toBeCalled();
        });
    });

    describe('undo()', () => {
        it('get last cache, and sets module state', () => {
            const commit = jest.fn() as any;
            const getStore = () => ({ commit } as Store<any>);

            const undoModule = new UndoContext({}, getStore, {
                name: 'foo',
                namespace: 'foo',
                setStateMutation: 'SET_STATE',
                stateCacheInterval: 10
            });

            const getLastSpy = jest.spyOn(UndoStateCache.prototype as any, 'getLast');

            undoModule.push({ type: 'a', payload: {} });
            undoModule.push({ type: 'b', payload: {} });

            undoModule.undo();

            // Check that previous state was set
            expect(getLastSpy).toHaveBeenCalled();
            expect(commit).toHaveBeenCalledTimes(2);
            expect(commit.mock.calls[0][0]).toBe('foo/SET_STATE');

            // Check that N - 1 mutations was replayed
            expect(commit.mock.calls[1][0]).toBe('a');
            expect(commit.mock.calls[1][1]._undo.isReplay).toBe(true);
        });
    });

    describe('redo()', () => {
        it('calls redo() on history', () => {
            const getStore = () => ({ commit: jest.fn() as any } as Store<any>);

            const undoModule = new UndoContext({}, getStore, {
                name: 'foo',
                namespace: 'foo',
                setStateMutation: 'SET_STATE',
                stateCacheInterval: 10
            });

            undoModule.push({ type: 'a', payload: {} });
            undoModule['_history']['_currentIndex'] = 0;

            const redoSpy = jest.spyOn(UndoHistory.prototype as any, 'redo');
            const replaySpy = jest.spyOn(UndoContext.prototype as any, '_replayMutations');
            const id = undoModule.redo();

            expect(redoSpy).toBeCalled();
            expect(replaySpy).toBeCalled();
        });
    });

    describe('group()', () => {
        it('starts and stops group with the module', async () => {
            const commit = jest.fn() as any;
            const getStore = () => ({ commit } as Store<any>);

            const undoModule = new UndoContext({}, getStore, {
                name: 'foo',
                namespace: 'foo',
                setStateMutation: 'SET_STATE',
                stateCacheInterval: 10
            });

            const startSpy = jest.spyOn(UndoHistory.prototype as any, 'startGroup');
            const stopSpy = jest.spyOn(UndoHistory.prototype as any, 'stopGroup');

            await undoModule.group(getStore);
            expect(startSpy).toHaveBeenCalled();
            expect(stopSpy).toHaveBeenCalled();
        });
    });

    describe('_replayMutations()', () => {
        it('commits every mutation', () => {
            const commit = jest.fn() as any;
            const getStore = () => ({ commit } as Store<any>);

            const undoModule = new UndoContext({}, getStore, {
                name: 'foo',
                namespace: 'foo',
                setStateMutation: 'SET_STATE',
                stateCacheInterval: 10
            });

            const mutations: UndoItemOrGroup[] = [
                { type: 'a', payload: {} },
                { type: 'b', payload: {} }
            ];

            undoModule['_replayMutations'](mutations, 'redo');
            expect(commit).toHaveBeenCalled();
        });
    });

    describe('_notifyCallbacks()', () => {
        it('stops when metadata is null', () => {
            const commit = jest.fn() as any;
            const getStore = () => ({ commit } as Store<any>);
            const mut: MutationPayload = {
                type: 'foo',
                payload: {}
            };

            const undoModule = new UndoContext({}, getStore, {
                name: 'foo',
                namespace: 'foo',
                setStateMutation: 'SET_STATE',
                stateCacheInterval: 10
            });

            expect(() => {
                undoModule['_notifyCallbacks'](mut, 'undo');
            }).not.toThrow();
        });

        it('calls redo callback', () => {
            const commit = jest.fn() as any;
            const getStore = () => ({ commit } as Store<any>);

            const redoCB = jest.fn();
            const undoCB = jest.fn();

            const mut: MutationPayload = {
                type: 'foo',
                payload: {
                    _undo: {
                        redoCallback: redoCB,
                        undoCallback: undoCB
                    }
                }
            };

            const undoModule = new UndoContext({}, getStore, {
                name: 'foo',
                namespace: 'foo',
                setStateMutation: 'SET_STATE',
                stateCacheInterval: 10
            });

            undoModule['_notifyCallbacks'](mut, 'redo');

            expect(redoCB).toHaveBeenCalled();
            expect(undoCB).not.toHaveBeenCalled();
        });

        it('calls undo callback', () => {
            const commit = jest.fn() as any;
            const getStore = () => ({ commit } as Store<any>);

            const redoCB = jest.fn();
            const undoCB = jest.fn();

            const mut: MutationPayload = {
                type: 'foo',
                payload: {
                    _undo: {
                        redoCallback: redoCB,
                        undoCallback: undoCB
                    }
                }
            };

            const undoModule = new UndoContext({}, getStore, {
                name: 'foo',
                namespace: 'foo',
                setStateMutation: 'SET_STATE',
                stateCacheInterval: 10
            });

            undoModule['_notifyCallbacks'](mut, 'undo');

            expect(undoCB).toHaveBeenCalled();
            expect(redoCB).not.toHaveBeenCalled();
        });
    });
});