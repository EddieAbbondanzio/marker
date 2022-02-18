// test("sidebar.updateScroll", () => {
//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [state, execute] = result.current;
//     expect(state.ui.sidebar.scroll).toBe(0);
//     execute("sidebar.updateScroll", 200);
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.scroll).toBe(200);
// });

// test("sidebar.scrollDown", () => {
//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [state, execute] = result.current;
//     expect(state.ui.sidebar.scroll).toBe(0);
//     execute("sidebar.scrollDown");
//     execute("sidebar.scrollDown");
//     execute("sidebar.scrollDown");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.scroll).toBe(NAV_MENU_HEIGHT * 3);
// });

// test("sidebar.scrollUp once", () => {
//   initialState.ui.sidebar.scroll = 120;
//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.scrollUp");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.scroll).toBe(90);
// });

// test("sidebar.scrollUp clamps", () => {
//   initialState.ui.sidebar.scroll = 30;
//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.scrollUp");
//     execute("sidebar.scrollUp");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.scroll).toBe(0);
// });

// test("sidebar.toggleExpanded collapses", () => {
//   let notebook = resourceId("notebook");
//   let tag = resourceId("tag");

//   initialState.ui.sidebar.explorer.expanded = [notebook, tag];
//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.toggleExpanded", notebook);
//   });

// let initialState: State;

// beforeEach(() => {
//   initialState = {
//     notebooks: [],
//     notes: [],
//     shortcuts: [],
//     tags: [],
//     ui: {
//       sidebar: {
//         explorer: {
//           view: "all",
//         },
//         filter: {},
//         scroll: 0,
//         width: "300px",
//       },
//       focused: [],
//     },
//   };

//   // Lots of commands call this internally so we stub it.
//   window.rpc = jest.fn();
// });

// test("sidebar.setSelection", () => {
//   const { result } = renderHook(() => useCommands(initialState));
//   let selected = [resourceId("tag")];
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.setSelection", selected);
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.selected).toBe(selected);
// });

// test("sidebar.setSelection", () => {
//   initialState.ui.sidebar.explorer.selected = [resourceId("tag")];
//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.clearSelection");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.selected).toEqual([]);
// });

// test("sidebar.setSelection stops if already clear", () => {
//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.clearSelection");
//   });

//   // Check by reference to see if it was changed
//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.selected).toBe(
//     initialState.ui.sidebar.explorer.selected
//   );
// });

// test("sidebar.moveSelectionUp moves up", () => {
//   let tag1 = createTag({ name: "a" });
//   let tag2 = createTag({ name: "b" });
//   let tag3 = createTag({ name: "c" });
//   initialState.ui.sidebar.explorer.view = "tags";
//   initialState.tags = [tag1, tag2, tag3];
//   initialState.ui.sidebar.explorer.selected = [tag2.id];

//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.moveSelectionUp");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.selected).toEqual([tag1.id]);
// });

// test("sidebar.moveSelectionUp clamps", () => {
//   let tag1 = createTag({ name: "a" });
//   let tag2 = createTag({ name: "b" });
//   let tag3 = createTag({ name: "c" });
//   initialState.ui.sidebar.explorer.view = "tags";
//   initialState.tags = [tag1, tag2, tag3];
//   initialState.ui.sidebar.explorer.selected = [tag1.id];

//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.moveSelectionUp");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.selected).toEqual([tag1.id]);
// });

// test("sidebar.moveSelectionUp starts at top", () => {
//   let tag1 = createTag({ name: "a" });
//   let tag2 = createTag({ name: "b" });
//   let tag3 = createTag({ name: "c" });
//   initialState.ui.sidebar.explorer.view = "tags";
//   initialState.tags = [tag1, tag2, tag3];

//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.moveSelectionUp");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.selected).toEqual([tag1.id]);
// });

// test("sidebar.moveSelectionDown moves down", () => {
//   let tag1 = createTag({ name: "a" });
//   let tag2 = createTag({ name: "b" });
//   let tag3 = createTag({ name: "c" });
//   initialState.ui.sidebar.explorer.view = "tags";
//   initialState.tags = [tag1, tag2, tag3];
//   initialState.ui.sidebar.explorer.selected = [tag2.id];

//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.moveSelectionDown");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.selected).toEqual([tag3.id]);
// });

// test("sidebar.moveSelectionDown clamps", () => {
//   let tag1 = createTag({ name: "a" });
//   let tag2 = createTag({ name: "b" });
//   let tag3 = createTag({ name: "c" });
//   initialState.ui.sidebar.explorer.view = "tags";
//   initialState.tags = [tag1, tag2, tag3];
//   initialState.ui.sidebar.explorer.selected = [tag3.id];

//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.moveSelectionDown");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.selected).toEqual([tag3.id]);
// });

// test("sidebar.moveSelectionDown starts at top", () => {
//   let tag1 = createTag({ name: "a" });
//   let tag2 = createTag({ name: "b" });
//   let tag3 = createTag({ name: "c" });
//   initialState.ui.sidebar.explorer.view = "tags";
//   initialState.tags = [tag1, tag2, tag3];

//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.moveSelectionDown");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.selected).toEqual([tag1.id]);
// });

// test("sidebar.setExplorerView", () => {
//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.setExplorerView", "favorites");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.view).toBe("favorites");
// });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.expanded).toEqual([tag]);
// });

// test("sidebar.createTag creates on confirm", async () => {
//   initialState.ui.sidebar.explorer.view = "all";
//   const { result } = renderHook(() => useCommands(initialState));
//   let commandCompleted: Promise<any>;

//   act(() => {
//     const [{ ui }, execute] = result.current;
//     expect(ui.sidebar.explorer.input).toBe(undefined);
//     commandCompleted = execute("sidebar.createTag");
//   });

//   await act(async () => {
//     const [{ ui }] = result.current;
//     const { input, view } = ui.sidebar.explorer;

//     expect(view).toBe("tags");
//     expect(input).not.toBe(undefined);
//     input!.onInput("foo");
//     input!.confirm();

//     await commandCompleted!;
//   });

//   const rpcCall = (window.rpc as jest.Mock).mock.calls.find(
//     (c) => c[0] === "tags.create"
//   );
//   expect(rpcCall[1]).toEqual({ name: "foo" });
//   const [{ ui }] = result.current;
//   expect(ui.sidebar.explorer.input).toBe(undefined);
// });

// test("sidebar.createTag cancels", async () => {
//   initialState.ui.sidebar.explorer.view = "all";
//   const { result } = renderHook(() => useCommands(initialState));
//   let commandCompleted: Promise<any>;

//   act(() => {
//     const [{ ui }, execute] = result.current;
//     expect(ui.sidebar.explorer.input).toBe(undefined);
//     commandCompleted = execute("sidebar.createTag");
//   });

//   await act(async () => {
//     const [{ ui }] = result.current;
//     const { input, view } = ui.sidebar.explorer;

//     expect(view).toBe("tags");
//     expect(input).not.toBe(undefined);
//     input!.onInput("foo");
//     input!.cancel();

//     await commandCompleted!;
//   });

//   const rpcCall = (window.rpc as jest.Mock).mock.calls.find(
//     (c) => c[0] === "tags.create"
//   );
//   expect(rpcCall).toBe(undefined);

//   const [{ ui }] = result.current;
//   expect(ui.sidebar.explorer.input).toBe(undefined);
// });