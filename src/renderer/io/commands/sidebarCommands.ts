import { clamp } from "lodash";
import { createAwaitableInput } from "../../../shared/awaitableInput";
import { UI } from "../../../shared/domain/state";
import { Menu } from "../../../shared/domain/valueObjects";
import { InvalidOpError, NotImplementedError } from "../../../shared/errors";
import { promptConfirmAction, promptError } from "../../utils/prompt";
import { CommandsForNamespace } from "./types";

export const sidebarCommands: CommandsForNamespace<"sidebar"> = {
  "sidebar.focus": async (ctx) => {
    ctx.setUI((ui) => ({
      ...ui,
      focused: ["sidebar"],
    }));
  },
  "sidebar.toggle": async (ctx) => {
    ctx.setUI((prev) => ({
      sidebar: {
        hidden: !(prev.sidebar.hidden ?? false),
      },
    }));
  },
  "sidebar.resizeWidth": async (ctx, width) => {
    if (width == null) {
      return;
    }

    ctx.setUI((prev) => ({
      sidebar: {
        width,
      },
    }));
  },
  "sidebar.updateScroll": async (ctx, scroll) => {
    if (scroll == null) {
      return;
    }

    ctx.setUI((prev) => ({
      sidebar: {
        scroll,
      },
    }));
  },
  "sidebar.scrollDown": async (ctx) => {
    ctx.setUI((prev) => {
      // Max scroll clamp is performed in scrollable.
      const scroll = prev.sidebar.scroll + 30;

      console.log("dw: ", scroll);

      return {
        sidebar: {
          scroll,
        },
      };
    });
  },
  "sidebar.scrollUp": async (ctx) => {
    ctx.setUI((prev) => {
      const scroll = Math.max(prev.sidebar.scroll - 30, 0);

      console.log("up: ", scroll);
      return {
        sidebar: {
          scroll,
        },
      };
    });
  },
  "sidebar.toggleFilter": async (ctx) => {
    ctx.setUI((prev) => {
      const expanded = !prev.sidebar.filter.expanded;

      console.log("new state: ", expanded);
      return {
        sidebar: {
          filter: {
            expanded,
          },
        },
      };
    });
  },
  "sidebar.createTag": async (ctx) => {
    let [tagInput, completed] = createAwaitableInput({ value: "" }, (value) => {
      ctx.setUI(
        (prev) =>
          ({
            sidebar: {
              explorer: {
                input: {
                  value,
                },
              },
            },
          } as UI)
      );
    });

    ctx.setUI((prev) => ({
      sidebar: {
        explorer: {
          input: tagInput,
        },
      },
    }));

    ctx.setUI((prev) => ({
      sidebar: {
        explorer: {
          input: {
            ...tagInput,
          },
        },
      },
    }));
    console.log("set the ui!");

    // if ((await completed) === "confirm") {
    //   try {
    //     const { value: name } = ctx.getState().ui.sidebar.tagInput!;
    //     const tag = await window.rpc("tags.create", {
    //       name,
    //     });
    //     ctx.setTags((tags) => [...tags, tag]);
    //   } catch (e) {
    //     promptError(e.message);
    //   }
    // }
    // ctx.setUI((prev) => ({
    //   ...prev,
    //   sidebar: {
    //     ...prev.sidebar,
    //     tagInput: undefined,
    //   },
    // }));
  },
  "sidebar.updateTag": async (ctx, id) => {
    // if (id == null) {
    //   throw Error(`No id passed.`);
    // }
    // const tag = ctx.getState().tags.find((t) => t.id === id)!;
    // let [tagInput, completed] = createAwaitableInput(
    //   { value: tag.name, id },
    //   (value) => {
    //     ctx.setUI((prev) => ({
    //       ...prev,
    //       sidebar: {
    //         ...prev.sidebar,
    //         tagInput: {
    //           ...prev.sidebar.tagInput!,
    //           value,
    //         },
    //       },
    //     }));
    //   }
    // );
    // ctx.setUI((prev) => ({
    //   ...prev,
    //   sidebar: {
    //     ...prev.sidebar,
    //     tagInput,
    //   },
    // }));
    // if ((await completed) === "confirm") {
    //   try {
    //     const { value: name } = ctx.getState().ui.sidebar.tagInput!;
    //     const tag = await window.rpc("tags.update", {
    //       id,
    //       newName: name,
    //     });
    //     ctx.setTags((tags) => [...tags.filter((t) => t.id !== tag.id), tag]);
    //   } catch (e) {
    //     promptError(e.message);
    //   }
    // }
    // ctx.setUI((prev) => ({
    //   ...prev,
    //   sidebar: {
    //     ...prev.sidebar,
    //     tagInput: undefined,
    //   },
    // }));
  },
  "sidebar.deleteTag": async (ctx, id) => {
    const tag = ctx.getState().tags.find((t) => t.id === id);

    if (tag == null) {
      throw Error(`No tag found with id ${id}`);
    }

    const res = await promptConfirmAction("delete", `tag ${tag.name}`);
    if (res.text === "Yes") {
      await window.rpc("tags.delete", { id: tag.id });
      ctx.setTags((tags) => [...tags.filter((t) => t.id !== tag.id)]);
    }
  },
  "sidebar.setSelection": async (ctx, selected) => {
    ctx.setUI((prev) => ({
      sidebar: {
        // selected,
      },
    }));
  },
  "sidebar.moveSelectionUp": async (ctx) => {
    // TODO: Support nested logic later on
    ctx.setUI((s) => {
      console.log("IMPLEMENT THIS!");

      return {
        ...s,
      };
    });
  },
  "sidebar.moveSelectionDown": async (ctx) => {
    console.log("move selection down");
  },
  "sidebar.setExplorerView": async (ctx, view) => {
    if (view == null) {
      return;
    }

    ctx.setUI((s) => ({
      ...s,
      sidebar: {
        ...s.sidebar,
        explorer: {
          ...s.sidebar.explorer,
          view,
        },
      },
    }));
  },
};
