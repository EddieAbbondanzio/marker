import React, { useEffect, useMemo } from "react";
import { px } from "../../shared/dom";
import { Resizable } from "./shared/Resizable";
import { Focusable } from "./shared/Focusable";
import { isResourceId } from "../../shared/domain";
import { Store, StoreContext, Listener } from "../store";
import styled from "styled-components";
import { h100, mh100, THEME, w100 } from "../css";
import { clamp, Dictionary, head, isEmpty, keyBy, orderBy, take } from "lodash";
import {
  Note,
  getNoteById,
  getNoteSchema,
  flatten,
} from "../../shared/domain/note";
import { createPromisedInput, PromisedInput } from "../../shared/promisedInput";
import { InvalidOpError, NotFoundError } from "../../shared/errors";
import { promptError, promptConfirmAction } from "../utils/prompt";
import { Scrollable } from "./shared/Scrollable";
import * as yup from "yup";
import { SIDEBAR_MENU_HEIGHT, SidebarMenu, SidebarInput } from "./SidebarMenu";
import {
  faChevronDown,
  faChevronRight,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { SidebarSearch } from "./SidebarSearch";
import { search } from "fast-fuzzy";
import { caseInsensitiveCompare } from "../../shared/utils";
import { filterOutStaleNoteIds } from "../../shared/domain/ui";
import { Icon } from "./shared/Icon";
import { SidebarControls } from "./SidebarControls";

const EXPANDED_ICON = faChevronDown;
const COLLAPSED_ICON = faChevronRight;
const MIN_WIDTH = px(300);

const NOTE_SORTER = caseInsensitiveCompare<Note>((n) => n.name);

export interface SidebarProps {
  store: Store;
}

export function Sidebar({ store }: SidebarProps): JSX.Element {
  const { sidebar } = store.state.ui;
  const { input } = sidebar;
  const expandedLookup = keyBy(sidebar.expanded, (e) => e);
  const selectedLookup = keyBy(sidebar.selected, (s) => s);

  const searchString = store.state.ui.sidebar.searchString;
  const notes = useMemo(
    () => applySearchString(store.state.notes, searchString),
    [searchString, store.state.notes]
  );
  const [menus, itemIds] = useMemo(
    () => renderMenus(notes, store, input, expandedLookup, selectedLookup),
    [notes, store, input, expandedLookup, selectedLookup]
  );

  // Sanity check
  if (input != null && input.parentId != null) {
    if (!isResourceId(input.parentId)) {
      throw new Error(
        `Explorer input parent id must be a global id. Instead '${input.parentId}' was passed.`
      );
    }
  }

  useEffect(() => {
    const getNext = (increment: number) => {
      if (isEmpty(sidebar.selected)) {
        return take(itemIds, 1);
      }
      let next = 0;
      let curr = 0;
      const firstSelected = head(sidebar.selected)!;
      curr = itemIds.findIndex((s) => s === firstSelected);
      if (curr === -1) {
        throw new NotFoundError(`No selectable ${firstSelected} found`);
      }

      next = clamp(curr + increment, 0, itemIds.length - 1);
      return itemIds.slice(next, next + 1);
    };

    const updateSelected: Listener<
      | "sidebar.clearSelection"
      | "sidebar.moveSelectionDown"
      | "sidebar.moveSelectionUp"
      | "sidebar.setSelection"
    > = async ({ type, value }, { setUI }) => {
      let selected: string[] | undefined;

      switch (type) {
        case "sidebar.moveSelectionDown":
          selected = getNext(1);
          break;
        case "sidebar.moveSelectionUp":
          selected = getNext(-1);
          break;
        case "sidebar.setSelection":
          if (value == null) {
            selected = undefined;
          } else {
            // HACK
            selected = [itemIds.find((i) => i === value[0])!];
          }
          break;
      }

      setUI({
        sidebar: {
          selected: selected == null ? undefined : [selected[0]],
          input: undefined,
        },
      });
    };

    store.on("sidebar.resizeWidth", resizeWidth);
    store.on("sidebar.scrollUp", scrollUp);
    store.on("sidebar.scrollDown", scrollDown);
    store.on("sidebar.updateScroll", updateScroll);
    store.on("sidebar.toggleItemExpanded", toggleItemExpanded);
    store.on(
      [
        "sidebar.moveSelectionUp",
        "sidebar.moveSelectionDown",
        "sidebar.clearSelection",
        "sidebar.setSelection",
      ],
      updateSelected
    );
    store.on("sidebar.createNote", createNote);
    store.on("sidebar.renameNote", renameNote);
    store.on(["sidebar.deleteNote", "sidebar.deleteSelectedNote"], deleteNote);
    store.on("sidebar.dragNote", dragNote);
    store.on("sidebar.moveNoteToTrash", moveNoteToTrash);
    store.on("sidebar.setSearchString", setSearchString);
    store.on("sidebar.collapseAll", collapseAll);
    store.on("sidebar.expandAll", expandAll);

    return () => {
      store.off("sidebar.resizeWidth", resizeWidth);
      store.off("sidebar.scrollUp", scrollUp);
      store.off("sidebar.scrollDown", scrollDown);
      store.off("sidebar.updateScroll", updateScroll);
      store.off("sidebar.toggleItemExpanded", toggleItemExpanded);
      store.off(
        [
          "sidebar.moveSelectionUp",
          "sidebar.moveSelectionDown",
          "sidebar.clearSelection",
          "sidebar.setSelection",
        ],
        updateSelected
      );
      store.off("sidebar.createNote", createNote);
      store.off("sidebar.renameNote", renameNote);
      store.off(
        ["sidebar.deleteNote", "sidebar.deleteSelectedNote"],
        deleteNote
      );
      store.off("sidebar.dragNote", dragNote);
      store.off("sidebar.moveNoteToTrash", moveNoteToTrash);
      store.off("sidebar.setSearchString", setSearchString);
      store.off("sidebar.collapseAll", collapseAll);
      store.off("sidebar.expandAll", expandAll);
    };
  }, [itemIds, sidebar, store]);

  return (
    <StyledResizable
      minWidth={MIN_WIDTH}
      width={store.state.ui.sidebar.width}
      onResize={(w) => store.dispatch("sidebar.resizeWidth", w)}
    >
      <Focusable store={store} name="sidebar">
        <SidebarSearch store={store} />
        <SidebarControls store={store} />

        <Scrollable
          height="calc(100% - 52px)"
          scroll={store.state.ui.sidebar.scroll}
          onScroll={(s) => store.dispatch("sidebar.updateScroll", s)}
        >
          {menus}

          {/* Empty space for right clicking to create new notes */}
          <EmptySpace />
        </Scrollable>
      </Focusable>
    </StyledResizable>
  );
}

const StyledResizable = styled(Resizable)`
  background-color: ${THEME.sidebar.background};
  user-select: none;
  ${h100}
`;

const EmptySpace = styled.div`
  padding-bottom: ${px(SIDEBAR_MENU_HEIGHT)};
`;

export function applySearchString(
  notes: Note[],
  searchString?: string
): Note[] {
  if (isEmpty(searchString)) {
    return notes;
  }

  const flatNotes = flatten(notes);
  const matches = search(searchString!, flatNotes, {
    keySelector: (n) => n.name,
  });

  return matches;
}

export function renderMenus(
  notes: Note[],
  store: Store,
  input: PromisedInput | undefined,
  expandedLookup: Dictionary<string>,
  selectedLookup: Dictionary<string>
): [JSX.Element[], string[]] {
  const menus: JSX.Element[] = [];
  const flatIds: string[] = [];

  const recursive = (note: Note, depth?: number) => {
    const isExpanded = expandedLookup[note.id];
    const isSelected = selectedLookup[note.id] != null;
    const currDepth = depth ?? 0;
    const hasChildren = !isEmpty(note.children);
    const hasInput =
      input != null && input.parentId != null && input.parentId === note.id;

    const onClick = () => {
      if (isSelected) {
        store.dispatch("sidebar.toggleItemExpanded", note.id);
      }
      store.dispatch("sidebar.setSelection", [note.id]);
      store.dispatch("editor.loadNote", note.id);
    };

    let icon;
    if (hasChildren || hasInput) {
      icon = isExpanded ? EXPANDED_ICON : COLLAPSED_ICON;
    }

    if (input?.id != null && input.id === note.id) {
      menus.push(
        <SidebarInput
          icon={icon}
          store={store}
          key="sidebarInput"
          value={input}
          depth={currDepth}
        />
      );
    } else {
      menus.push(
        <SidebarMenu
          store={store}
          icon={icon}
          key={note.id}
          id={note.id}
          value={note.name}
          onClick={onClick}
          onIconClick={(ev: React.MouseEvent) => {
            // Prevents click of menu itself from triggering
            ev.stopPropagation();
            store.dispatch("sidebar.toggleItemExpanded", note.id);
          }}
          onDrag={(newParent) =>
            store.dispatch("sidebar.dragNote", { note: note.id, newParent })
          }
          isSelected={isSelected}
          depth={currDepth}
        />
      );
    }

    flatIds.push(note.id);

    if (hasChildren && isExpanded) {
      note.children = note.children?.sort(NOTE_SORTER);
      note.children?.forEach((n) => recursive(n, currDepth + 1));
    }

    // When creating a new value input is always added to end of list
    if (hasInput) {
      menus.push(
        <SidebarInput
          store={store}
          key="sidebarInput"
          value={input}
          depth={currDepth + 1}
        />
      );
    }
  };

  notes = notes?.sort(NOTE_SORTER);
  notes.forEach((n) => recursive(n));

  if (input != null && input.parentId == null && input.id == null) {
    menus.push(
      <SidebarInput store={store} key="sidebarInput" value={input} depth={0} />
    );
  }

  return [menus, flatIds];
}

export const resizeWidth: Listener<"sidebar.resizeWidth"> = (
  { value: width },
  ctx
) => {
  if (width == null) {
    throw Error();
  }

  ctx.setUI({
    sidebar: {
      width,
    },
  });
};

export const updateScroll: Listener<"sidebar.updateScroll"> = (
  { value: scroll },
  ctx
) => {
  if (scroll == null) {
    throw Error();
  }

  ctx.setUI({
    sidebar: {
      scroll,
    },
  });
};

export const scrollUp: Listener<"sidebar.scrollUp"> = (_, { setUI }) => {
  setUI((prev) => {
    const scroll = Math.max(prev.sidebar.scroll - SIDEBAR_MENU_HEIGHT, 0);
    return {
      sidebar: {
        scroll,
      },
    };
  });
};

export const scrollDown: Listener<"sidebar.scrollDown"> = (_, { setUI }) => {
  setUI((prev) => {
    // Max scroll clamp is performed in scrollable.
    const scroll = prev.sidebar.scroll + SIDEBAR_MENU_HEIGHT;
    return {
      sidebar: {
        scroll,
      },
    };
  });
};

export const toggleItemExpanded: Listener<"sidebar.toggleItemExpanded"> = (
  { value: id },
  ctx
) => {
  const state = ctx.getState();
  if (state.ui.sidebar.input) {
    ctx.setUI({ sidebar: { input: undefined } });
  }

  const { selected } = ctx.getState().ui.sidebar;
  toggleExpanded(ctx, id ?? head(selected));
};

export const createNote: Listener<"sidebar.createNote"> = async (
  { value: parentId },
  ctx
) => {
  let {
    ui: {
      sidebar: { expanded },
    },
  } = ctx.getState();

  const schema: yup.StringSchema = yup.reach(getNoteSchema(), "name");
  const input = createPromisedInput(
    {
      schema,
      parentId: parentId ?? undefined,
      resourceType: "note",
    },
    setExplorerInput(ctx)
  );

  if (
    parentId != null &&
    (expanded == null || expanded?.every((id) => id !== parentId))
  ) {
    expanded ??= [];
    expanded.push(parentId);
  }

  ctx.focus(["sidebarInput"], { overwrite: true });
  ctx.setUI({
    sidebar: {
      input,
      expanded,
    },
  });

  const [name, action] = await input.completed;
  if (action === "confirm") {
    try {
      const note = await window.ipc(
        "notes.create",
        name,
        parentId ?? undefined
      );

      ctx.setNotes((notes) => {
        if (parentId == null) {
          return [...notes, note];
        } else {
          const parent = getNoteById(notes, parentId);
          parent.children ??= [];
          parent.children.push(note);
          note.parent = parent.id;
          return notes;
        }
      });

      ctx.focus(["editor"], { overwrite: true });
      ctx.setUI({
        sidebar: {
          selected: [note.id],
        },
        editor: {
          isEditting: true,
          noteId: note.id,
          content: "",
        },
      });
    } catch (e) {
      promptError(e.message);
    }
  }

  ctx.setUI({
    sidebar: {
      input: undefined,
    },
  });
};

export const renameNote: Listener<"sidebar.renameNote"> = async (
  { value: id },
  ctx
) => {
  const { notes } = ctx.getState();
  const schema: yup.StringSchema = yup.reach(getNoteSchema(), "name");
  const { name: value } = getNoteById(notes, id!);
  const input = createPromisedInput(
    {
      id,
      value,
      schema,
      resourceType: "note",
    },
    setExplorerInput(ctx)
  );
  ctx.focus(["sidebarInput"]);
  ctx.setUI({
    sidebar: {
      input,
    },
  });

  const [name, action] = await input.completed;
  if (action === "confirm") {
    try {
      const note = getNoteById(notes, id!);
      const updatedNote = await window.ipc("notes.updateMetadata", id, {
        name,
      });

      ctx.setNotes((notes) => {
        if (updatedNote.parent == null) {
          const index = notes.findIndex((n) => n.id === note.id);
          notes.splice(index, 1, updatedNote);
          return notes;
        } else {
          const parent = getNoteById(notes, updatedNote.parent);
          const index = notes.findIndex((n) => n.id === note.id);
          parent.children!.splice(index, 1, updatedNote);
          return notes;
        }
      });
    } catch (e) {
      promptError(e.message);
    }
  }

  ctx.setUI({
    sidebar: {
      input: undefined,
    },
  });
};

export const deleteNote: Listener<
  "sidebar.deleteNote" | "sidebar.deleteSelectedNote"
> = async (ev, ctx) => {
  const { ui, notes } = ctx.getState();
  let id;

  switch (ev.type) {
    case "sidebar.deleteNote":
      if (ev.value == null) {
        throw new Error("No note to delete.");
      }

      id = ev.value;
      break;
    case "sidebar.deleteSelectedNote":
      const { selected } = ui.sidebar;
      // User could accidentally press delete when nothing is selected so we
      // don't throw here.
      if (isEmpty(selected)) {
        return;
      }

      id = head(selected)!;
      break;

    default:
      throw new InvalidOpError(`Invalid event type ${ev.type}`);
  }

  const note = getNoteById(notes, id);
  const confirmed = await promptConfirmAction("delete", `note ${note.name}`);
  if (confirmed) {
    await window.ipc("notes.delete", note.id);
    ctx.setNotes((notes) => {
      if (note.parent == null) {
        return notes.filter((t) => t.id !== note.id);
      }

      const parent = getNoteById(notes, note.parent);
      parent.children = parent.children!.filter((t) => t.id !== note.id);
      return notes;
    });

    ctx.setUI((ui) => filterOutStaleNoteIds(ui, notes));
  }
};

export const moveNoteToTrash: Listener<"sidebar.moveNoteToTrash"> = async (
  { value: id },
  ctx
) => {
  const { notes } = ctx.getState();
  const note = getNoteById(notes, id!);
  const confirmed = await promptConfirmAction("trash", `note ${note.name}`);
  if (confirmed) {
    await window.ipc("notes.moveToTrash", note.id);
    ctx.setNotes((notes) => {
      if (note.parent == null) {
        return notes.filter((t) => t.id !== note.id);
      }

      const parent = getNoteById(notes, note.parent);
      parent.children = parent.children!.filter((t) => t.id !== note.id);
      return notes;
    });
  }
};

export const dragNote: Listener<"sidebar.dragNote"> = async (
  { value },
  ctx
) => {
  const { notes, ui } = ctx.getState();
  const note = getNoteById(notes, value.note);
  let newParent;
  if (value.newParent != null) {
    newParent = getNoteById(notes, value.newParent);
  }

  // Don't allow if parent is itself
  if (note.id === value.newParent) {
    return;
  }

  // Don't bother if parent is the same (also prevents root note moving to root)
  if (note.parent === newParent?.id) {
    return;
  }

  // Prevent infinite loop by ensuring we can't reach the child from the parent.
  if (!isEmpty(note.children) && newParent != null) {
    const isNewParentChildOfNote =
      getNoteById(note.children!, newParent.id, false) != null;
    if (isNewParentChildOfNote) {
      return;
    }
  }

  const updatedNote = await window.ipc("notes.updateMetadata", note.id, {
    parent: newParent?.id,
  });

  ctx.setNotes((notes) => {
    // Remove child from original parent. (If applicable)
    if (note.parent != null) {
      const ogParent = getNoteById(notes, note.parent);
      ogParent.children = (ogParent.children ?? []).filter(
        (c) => c.id !== note.id
      );
    } else {
      notes = notes.filter((n) => n.id !== note.id);
    }

    // Add to new parent (if applicable)
    if (updatedNote.parent != null) {
      const newParent = getNoteById(notes, updatedNote.parent);
      newParent.children ??= [];
      newParent.children.push(updatedNote);
      updatedNote.parent = newParent.id;
    } else {
      notes.push(updatedNote);
    }

    return notes;
  });

  const newParentId = newParent?.id;
  if (
    newParent != null &&
    !ui.sidebar.expanded?.some((id) => id === newParentId)
  ) {
    toggleExpanded(ctx, newParent.id);
  }
};

export const setSearchString: Listener<"sidebar.setSearchString"> = async (
  { value: searchString },
  ctx
) => {
  ctx.setUI({
    sidebar: {
      searchString,
    },
  });
};

export const expandAll: Listener<"sidebar.expandAll"> = async (_, ctx) => {
  const { notes } = ctx.getState();
  const flattened = flatten(notes);
  ctx.setUI({
    sidebar: {
      expanded: flattened.filter((n) => !isEmpty(n.children)).map((n) => n.id),
    },
  });
};

export const collapseAll: Listener<"sidebar.collapseAll"> = async (_, ctx) => {
  ctx.setUI({
    sidebar: {
      expanded: [],
    },
  });
};

function toggleExpanded(ctx: StoreContext, noteId: string): void {
  ctx.setUI((prev) => {
    if (noteId == null) {
      throw new Error("No item to toggle");
    }

    // Don't expand notes with no children
    const { notes } = ctx.getState();
    const note = getNoteById(notes, noteId);
    if (isEmpty(note.children)) {
      return prev;
    }

    const { sidebar } = prev;
    if (isEmpty(sidebar.expanded)) {
      sidebar.expanded = [noteId];
      return prev;
    }

    const exists = sidebar.expanded!.some(
      (expandedId) => expandedId === noteId
    );
    if (exists) {
      sidebar.expanded = sidebar.expanded!.filter(
        (expandedId) => expandedId !== noteId
      );
    } else {
      sidebar.expanded!.push(noteId);
    }

    return prev;
  });
}

function setExplorerInput(ctx: StoreContext) {
  return (value: string) =>
    ctx.setUI({
      sidebar: {
        input: {
          value,
        },
      },
    });
}
