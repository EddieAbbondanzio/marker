import { debounce, head, isEmpty, last, tail } from "lodash";
import React, { useEffect } from "react";
import styled from "styled-components";
import { EditorTab, Section } from "../../shared/ui/app";
import { Ipc } from "../../shared/ipc";
import { m2 } from "../css";
import { Listener, Store } from "../store";
import { Markdown } from "./Markdown";
import { Monaco } from "./Monaco";
import { Focusable } from "./shared/Focusable";
import { getNoteById } from "../../shared/domain/note";
import { EditorTabs, TABS_HEIGHT } from "./EditorTabs";
import * as monaco from "monaco-editor";

const NOTE_SAVE_INTERVAL_MS = 500;

interface EditorProps {
  store: Store;
}

export function Editor(props: EditorProps): JSX.Element {
  const { store } = props;
  const { state } = store;
  const { editor } = state;

  let activeTab;
  if (editor.activeTabNoteId != null) {
    activeTab = editor.tabs.find((t) => t.noteId === editor.activeTabNoteId);
  }

  let content;
  if (state.editor.isEditting) {
    content = <Monaco store={store} />;
  } else {
    content = (
      <Markdown
        store={store}
        content={activeTab?.noteContent ?? ""}
        scroll={state.editor.scroll}
        onScroll={(newVal) =>
          void store.dispatch("editor.updateScroll", newVal)
        }
      />
    );
  }

  useEffect(() => {
    store.on("editor.setContent", setContent);
    store.on("editor.save", save);
    store.on("editor.toggleView", toggleView);
    store.on("editor.updateScroll", updateScroll);

    return () => {
      store.off("editor.setContent", setContent);
      store.off("editor.save", save);
      store.off("editor.toggleView", toggleView);
      store.off("editor.updateScroll", updateScroll);
    };
  }, [store]);

  return (
    <StyledFocusable store={store} name={Section.Editor} focusOnRender={false}>
      <EditorTabs store={store} />
      <StyledContent>{content}</StyledContent>
    </StyledFocusable>
  );
}

const StyledFocusable = styled(Focusable)`
  flex-grow: 1;
  overflow-y: hidden;
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100% - ${TABS_HEIGHT});
  ${m2}
  overflow: hidden;
`;

const debouncedInvoker = debounce(window.ipc, NOTE_SAVE_INTERVAL_MS) as Ipc;

const setContent: Listener<"editor.setContent"> = async (
  { value: { noteId, content } },
  ctx
) => {
  ctx.setUI((prev) => {
    const index = prev.editor.tabs.findIndex(
      (t) => t.noteId === prev.editor.activeTabNoteId
    );
    // Update local cache for renderer
    prev.editor.tabs[index].noteContent = content;

    return {
      editor: {
        tabs: [...prev.editor.tabs],
      },
    };
  });

  await debouncedInvoker("notes.saveContent", noteId, content);
};

const toggleView: Listener<"editor.toggleView"> = (_, ctx) => {
  const { editor } = ctx.getState();

  if (editor.tabs == null || editor.tabs.length === 0) {
    return;
  }

  ctx.setUI({
    editor: {
      isEditting: !editor.isEditting,
    },
  });
};

const save: Listener<"editor.save"> = (_, ctx) => {
  const { editor } = ctx.getState();

  if (!editor.isEditting) {
    return;
  }

  /*
   * We don't actually do any saving within this listener. This is just a fake
   * save function for the user to change the app back to read view.
   */

  ctx.setUI({
    editor: {
      isEditting: false,
    },
  });
};

export const updateScroll: Listener<"editor.updateScroll"> = (
  { value: scroll },
  ctx
) => {
  if (scroll == null) {
    throw Error();
  }

  ctx.setUI({
    editor: {
      scroll,
    },
  });
};
