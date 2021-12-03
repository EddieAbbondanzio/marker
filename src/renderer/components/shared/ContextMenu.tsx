// import React, { useContext, useEffect, useRef, useState } from "react";
// import { PropsWithChildren } from "react";
// import { generateId, State } from "../../../shared/state";
// import { getNodeEnv } from "../../../shared/env";
// import { keyCodesToString } from "../../../shared/io/keyCode";
// import { CommandName, Execute } from "../../commands";
// import { findParent } from "../../ui/findParent";
// // import { AppContext } from "../../App";

// export interface ContextMenuItem {
//   text: string;
//   show?: boolean;
//   command: string;
// }

// export interface ContextMenuProps {
//   name: string;
//   items: (target: HTMLElement) => ContextMenuItem[];
//   state: State;
//   execute: Execute;
// }

// export function ContextMenu(props: PropsWithChildren<ContextMenuProps>) {
//   const ref = useRef(null as unknown as HTMLDivElement);
//   const [state, setState] = useState({
//     id: null as string | null,
//     menu: null as JSX.Element | null,
//   });

//   // const context = useContext(AppContext)!;

//   useEffect(() => {
//     const wrapper = ref.current;

//     const onContextMenu = (ev: MouseEvent) => {
//       const target = ev.target as HTMLElement;

//       const onClick = (item: ContextMenuItem) => {
//         if (item.command != null && item.command.length > 0) {
//           console.log("Execute: ", item.command);
//           void props.execute(item.command as CommandName, undefined!);
//         }
//       };

//       const items = props.items(target);

//       // Add dev mode helpers
//       if (getNodeEnv() === "development") {
//         items.push({
//           text: "Open Dev Tools",
//           command: "app.openDevTools",
//         });
//       }

//       // Render each item
//       const renderedItems = items.map((item) => {
//         const shortcut = props.state.shortcuts.values.find(
//           (s) => s.command === item.command
//         );

//         const shortcutString =
//           shortcut != null ? keyCodesToString(shortcut.keys) : null;

//         return (
//           <div
//             onClick={() => onClick(item)}
//             className="has-background-primary-hover px-2 py-1 is-flex is-justify-content-space-between is-align-items-center"
//             key={item.text}
//           >
//             {item.text}
//             <span className="is-size-7 is-uppercase has-text-grey pl-2">
//               {shortcutString}
//             </span>
//           </div>
//         );
//       });

//       const id = generateId();
//       const top = ev.clientY;
//       const left = ev.clientX;

//       const menu = (
//         <div
//           className="box m-0 p-0"
//           id={id}
//           style={{ position: "absolute", zIndex: 1, top, left }}
//         >
//           <div>{renderedItems}</div>
//         </div>
//       );

//       setState({
//         id,
//         menu,
//       });
//     };

//     const listenForClose = (ev: MouseEvent) => {
//       const match = findParent(
//         ev.target as HTMLElement,
//         (el) => el.id === state.id
//       );

//       if (!match) {
//         setState({
//           id: null,
//           menu: null,
//         });
//       }
//     };

//     // How do we know when to close it?

//     wrapper.addEventListener("contextmenu", onContextMenu);
//     window.addEventListener("click", listenForClose);

//     return () => {
//       wrapper.removeEventListener("contextmenu", onContextMenu);
//       window.removeEventListener("clicK", listenForClose);
//     };
//   }, []);

//   return (
//     <div
//       ref={ref}
//       className="is-flex is-flex-direction-column is-flex-grow-1"
//       data-context-menu={props.name}
//     >
//       {state.menu}
//       {props.children}
//     </div>
//   );
// }