import React, {
  PropsWithChildren,
  RefObject,
  useContext,
  useLayoutEffect,
  useRef,
} from "react";
import { InvalidOpError } from "../../../shared/errors";
import { KeyCode } from "../../../shared/io/keyCode";
import { useKeyboard } from "../../io/keyboard";
import { findParent } from "../../utils/findParent";
import { FocusContext } from "./FocusTracker";

export const FOCUSABLE_ATTRIBUTE = "data-focusable";

export interface FocusableProps {
  name: string;
  className?: string;
  overwrite?: boolean;
  // OLn
  blurOnEscape?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function Focusable(props: PropsWithChildren<FocusableProps>) {
  const ctx = useContext(FocusContext);
  const ref = useRef(null! as HTMLDivElement);
  const kb = useKeyboard(ref);

  const publish = (ev: FocusEvent) => {
    // We stop propagation to support nested focusables
    ev.stopPropagation();
    ctx.push(props.name, props.overwrite);
  };

  // Listen for if we should blur it.
  kb.listen({ keys: [KeyCode.Escape], event: "keydown" }, async (ev) => {
    if (props.blurOnEscape == null || !props.blurOnEscape) {
      return;
    }

    // We stop propagation to support nested focusables
    ev.stopPropagation();

    const div = ref.current;
    if (div != null) {
      div.blur();
      ctx.pop();

      // See if we can find a parent focusable and give it focus.
      const parent = findParent(
        div,
        (el) => {
          const attr = el.getAttribute(FOCUSABLE_ATTRIBUTE);
          return attr != null && attr !== props.name;
        },
        { matchValue: (el) => el.getAttribute(FOCUSABLE_ATTRIBUTE) }
      );

      if (parent != null) {
        ctx.push(parent);
      }
    }
  });

  /*
   * Focusables communicate with the root FocusTracker component via pub / sub.
   * We need to initialize this component in useLayoutEffect() so it's ready
   * before the FocusTracker.
   */
  useLayoutEffect(() => {
    const name = props.name;
    const div = ref.current;

    div.addEventListener("focusin", publish);
    ctx.subscribe(name, (ev) => {
      switch (ev) {
        case "focus":
          ref.current.focus();
          props.onFocus?.();

          break;
        case "blur":
          ref.current.blur();
          props.onBlur?.();
          break;
        default:
          throw new InvalidOpError(`Focusable got event: ${ev}`);
      }
    });

    return () => {
      div.removeEventListener("focusin", publish);
      ctx.unsubscribe(name);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={props.className}
      tabIndex={-1}
      {...{ [FOCUSABLE_ATTRIBUTE]: props.name }}
    >
      {props.children}
    </div>
  );
}
