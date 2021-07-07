import { UndoModuleSettings } from '@/store/plugins/undo/types';
import { undo } from '@/store/plugins/undo/undo';
import { UndoHistory } from '@/store/plugins/undo/undo-history';

describe('undo vuex plugin', () => {
    beforeEach(() => undo.reset());

    describe('plugin()', () => {
        it('caches store', () => {
            const s = undo.plugin({ commit: jest.fn(), subscribe: jest.fn() } as any);
            expect(s.store).toHaveProperty('commit');
        });
    });

    describe('registerModule()', () => {
        it('throws if duplicate name', () => {
            const s = undo.plugin({ commit: jest.fn(), subscribe: jest.fn() } as any);

            undo.registerModule(
                { foo: 1 },
                {
                    name: 'foo',
                    namespace: 'foo',
                    setStateMutation: 'SET_STATE',
                    stateCacheInterval: 100
                }
            );

            expect(() => {
                undo.registerModule(
                    { foo: 1 },
                    {
                        name: 'foo',
                        namespace: 'foo',
                        setStateMutation: 'SET_STATE',
                        stateCacheInterval: 100
                    }
                );
            }).toThrow();
        });

        it('adds set state mutation to ignore list', () => {
            const s = undo.plugin({ commit: jest.fn(), subscribe: jest.fn() } as any);

            const settings: UndoModuleSettings = {
                name: 'foo',
                namespace: 'foo',
                setStateMutation: 'SET_STATE',
                stateCacheInterval: 100
            };

            undo.registerModule({ foo: 1 }, settings);
            expect(settings.ignore).toHaveLength(1);
        });

        it('namespaces all ignore list mutations', () => {
            const s = undo.plugin({ commit: jest.fn(), subscribe: jest.fn() } as any);

            const settings: UndoModuleSettings = {
                name: 'foo',
                namespace: 'foo',
                setStateMutation: 'SET_STATE',
                stateCacheInterval: 100,
                ignore: ['name']
            };

            undo.registerModule({ foo: 1 }, settings);
            expect(settings.ignore).toHaveLength(2);
            expect(settings.ignore![0]).toBe('foo/SET_STATE');
            expect(settings.ignore![1]).toBe('foo/name');
        });

        it('adds the module', () => {
            const s = undo.plugin({ commit: jest.fn(), subscribe: jest.fn() } as any);

            undo.registerModule(
                { foo: 1 },
                {
                    name: 'foo',
                    namespace: 'foo',
                    setStateMutation: 'SET_STATE',
                    stateCacheInterval: 100
                }
            );

            expect(s.modules['foo']).toBeTruthy();
        });
    });

    describe('getModule()', () => {
        it('throws if no module found', () => {
            const s = undo.plugin({ commit: jest.fn(), subscribe: jest.fn() } as any);
            expect(() => undo.getModule('bar')).toThrow();
        });

        it('returns module', () => {
            const s = undo.plugin({ commit: jest.fn(), subscribe: jest.fn() } as any);
            undo.registerModule(
                { foo: 1 },
                {
                    name: 'foo',
                    namespace: 'fooNamespace',
                    setStateMutation: 'SET_STATE',
                    stateCacheInterval: 100
                }
            );

            const m = undo.getModule('foo');
            expect(m.settings.namespace).toBe('fooNamespace');
        });
    });

    describe('onMutation()', () => {
        it('does nothing on non tracked module', () => {
            const s = undo.plugin({ commit: jest.fn(), subscribe: jest.fn() } as any);
            undo.registerModule(
                { foo: 1 },
                {
                    name: 'foo',
                    namespace: 'fooNamespace',
                    setStateMutation: 'SET_STATE',
                    stateCacheInterval: 100
                }
            );

            expect(() => undo.onMutation({ type: 'bar', payload: {} }, {} as any)).not.toThrow();
        });

        it('does nothing if on ignore list', () => {
            const s = undo.plugin({ commit: jest.fn(), subscribe: jest.fn() } as any);
            undo.registerModule(
                { foo: 1 },
                {
                    name: 'foo',
                    namespace: 'fooNamespace',
                    setStateMutation: 'SET_STATE',
                    stateCacheInterval: 100,
                    ignore: ['IGNORED_MUT']
                }
            );

            expect(() => undo.onMutation({ type: 'fooNamespace/IGNORED_MUT', payload: {} }, {} as any)).not.toThrow();
        });

        it('throws error if mutation payload is not an object', () => {
            const s = undo.plugin({ commit: jest.fn(), subscribe: jest.fn() } as any);
            undo.registerModule(
                { foo: 1 },
                {
                    name: 'foo',
                    namespace: 'fooNamespace',
                    setStateMutation: 'SET_STATE',
                    stateCacheInterval: 100,
                    ignore: ['IGNORED_MUT']
                }
            );

            expect(() => undo.onMutation({ type: 'fooNamespace/SAVE_THAT', payload: 1 }, {} as any)).toThrow();
        });

        it('adds event to module history', () => {
            const s = undo.plugin({ commit: jest.fn(), subscribe: jest.fn() } as any);
            undo.registerModule(
                { foo: 1 },
                {
                    name: 'foo',
                    namespace: 'fooNamespace',
                    setStateMutation: 'SET_STATE',
                    stateCacheInterval: 100,
                    ignore: ['IGNORED_MUT']
                }
            );

            undo.onMutation({ type: 'fooNamespace/SAVE_THAT', payload: { val: 1 } }, {} as any);

            const m = undo.getModule('foo');
            expect(m['_history'].events).toHaveLength(1);
        });

        it('ignores if metadata has ignore flag set', () => {
            const s = undo.plugin({ commit: jest.fn(), subscribe: jest.fn() } as any);
            undo.registerModule(
                { foo: 1 },
                {
                    name: 'foo',
                    namespace: 'fooNamespace',
                    setStateMutation: 'SET_STATE',
                    stateCacheInterval: 100,
                    ignore: ['IGNORED_MUT']
                }
            );

            undo.onMutation({ type: 'fooNamespace/SAVE_THAT', payload: { val: 1, undo: { ignore: true } } }, {} as any);

            const m = undo.getModule('foo');
            expect(m['_history'].events).toHaveLength(0);
        });
    });

    describe('reset()', () => {
        const s = undo.plugin({ commit: jest.fn(), subscribe: jest.fn() } as any);
        undo.registerModule(
            { foo: 1 },
            {
                name: 'foo',
                namespace: 'fooNamespace',
                setStateMutation: 'SET_STATE',
                stateCacheInterval: 100,
                ignore: ['IGNORED_MUT']
            }
        );

        undo.reset();
        expect(s.modules).toEqual({});
    });
});