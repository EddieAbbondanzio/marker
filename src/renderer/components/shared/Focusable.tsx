import React, { createRef, PropsWithChildren, useEffect, useRef } from "react";
import { State } from "../../../shared/domain";
import { findParent } from "../../ui/findParent";

export interface FocusableProps {
  name: string;
}

export function Focusable(props: PropsWithChildren<FocusableProps>) {
  const divProps = {
    [FOCUSABLE_ATTRIBUTE]: props.name,
    tabIndex: -1,
  };

  return (
    <div
      className="is-flex is-flex-grow-1 is-flex-direction-column"
      {...divProps}
    >
      {props.children}
    </div>
  );
}

export const FOCUSABLE_ATTRIBUTE = "data-focusable";

export function useFocus(
  state: State,
  setAppState: (s: State) => Promise<void>
) {
  useEffect(() => {
    window.addEventListener("focusin", onFocusIn);

    return () => {
      window.removeEventListener("focusin", onFocusIn);
    };
  });

  function onFocusIn(event: FocusEvent) {
    // We might need to climb up the dom tree to handle nested children of a scope.
    const focused = findParent(
      event.target as HTMLElement,
      (el) => el.hasAttribute(FOCUSABLE_ATTRIBUTE),
      {
        matchValue: (el) => el.getAttribute(FOCUSABLE_ATTRIBUTE),
        defaultValue: undefined,
      }
    );

    const { ui } = state;
    setAppState({
      ...state,
      ui: { ...ui, focused: focused == null ? undefined : focused },
    });
  }
}
