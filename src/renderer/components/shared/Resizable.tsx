import _, { debounce } from "lodash";
import React, {
  HtmlHTMLAttributes,
  useCallback,
  useRef,
  useState,
} from "react";
import { getPx, isPx, px } from "../../dom/units";
import { MouseButton, MouseHandler, useMouse } from "../../hooks/mouse";

export interface ResizableProps {
  minWidth?: string;
  width?: string;
  onResize?: (newWidth: string) => void;
}

export interface ResizableState {
  width: string;
}

export function Resizable(props: React.PropsWithChildren<ResizableProps>) {
  if (props.width != null && !isPx(props.width)) {
    throw Error("Invalid width format. Expected pixels");
  }

  const wrapper = useRef(null as unknown as HTMLDivElement);
  const handle = useRef(null as unknown as HTMLDivElement);

  const minWidth = props.minWidth ?? px(100);
  const [state, setState] = useState({
    width: props.width ?? String(minWidth),
    minWidth,
  });

  const drag = useCallback((event: MouseEvent) => {
    const minWidthInt = getPx(minWidth);

    const containerOffsetLeft = wrapper.current.offsetLeft;
    const pointerRelativeXpos = event.clientX - containerOffsetLeft;

    const width = px(Math.max(minWidthInt, pointerRelativeXpos));
    setState({ width } as any);
  }, []);

  const release = useCallback(
    (event: MouseEvent) => {
      props.onResize!(state.width);
    },
    [state]
  );

  const mouseHandlers: MouseHandler[] = [
    {
      action: "drag",
      callback: drag,
    },
    {
      action: "release",
      callback: release,
    },
  ];

  useMouse(handle, mouseHandlers);

  return (
    <div className="resizable-wrapper" ref={wrapper} style={state}>
      {props.children}
      <div className="resizable-handle" ref={handle}>
        &nbsp;
      </div>
    </div>
  );
}