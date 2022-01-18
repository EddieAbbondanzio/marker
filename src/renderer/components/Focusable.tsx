import React, {
  PropsWithChildren,
  useContext,
  useLayoutEffect,
  useRef,
} from "react";
import { Section } from "../../shared/domain/state";
import { KeyCode } from "../../shared/io/keyCode";
import { useKeyboard } from "../io/keyboard";
import { FocusContext } from "./FocusTracker";

export interface FocusableProps {
  name: Section;
  className?: string;
  overwrite?: boolean;
}

export function Focusable(props: PropsWithChildren<FocusableProps>) {
  const ctx = useContext(FocusContext);
  const ref = useRef(null! as HTMLDivElement);
  const kb = useKeyboard(ref);

  const publish = () => {
    ctx.push(props.name, ref, props.overwrite);
  };

  // Listen for if we should blur it.
  kb.listen({ keys: [KeyCode.Escape], event: "keydown" }, async () => {
    const div = ref.current;

    if (div != null) {
      div.blur();
      ctx.pop();
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
    ctx.subscribe(name, () => {
      div.focus();
    });

    return () => {
      div.removeEventListener("focusin", publish);
      ctx.unsubscribe(name);
    };
  }, []);

  return (
    <div ref={ref} className={props.className} tabIndex={-1}>
      {props.children}
    </div>
  );
}
