import { cloneDeep, merge, mergeWith } from "lodash";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { App } from "../../../shared/domain/app";
import { deepUpdate } from "../../utils/deepUpdate";
import { appCommands } from "./appCommands";
import { editorCommands } from "./editorCommands";
import { sidebarCommands } from "./sidebarCommands";
import { CommandInput, CommandSchema, CommandType, SetUI } from "./types";

/*
 * Please don't refactor this unless you fully consider all the requirements.
 * - Intellisense completion is very important.
 * - Commands need to be able to get the most recent state at any time.
 */

export const commands: CommandSchema = {
  ...appCommands,
  ...sidebarCommands,
  ...editorCommands,
};

export type Execute = <C extends CommandType>(
  command: C,
  input?: CommandInput<C>
) => Promise<void>;

// Commands really only oeprate on UI
export function useCommands(initialState: App): [App, Execute, SetUI] {
  // Sampled: https://github.com/dai-shi/use-reducer-async/blob/main/src/index.ts

  const [state, setState] = useState(initialState);
  const lastState = useRef(state);

  // We need to run these first
  useLayoutEffect(() => {
    lastState.current = state;
  }, [state]);

  const getState = useCallback(() => {
    const cloned = cloneDeep(lastState.current);
    return cloned;
  }, []);

  const setUI: SetUI = (transformer) => {
    setState((prevState) => {
      const updates =
        typeof transformer === "function"
          ? transformer(prevState)
          : transformer;

      const ui = deepUpdate(prevState, updates);
      void window.rpc("app.saveState", cloneDeep(ui));
      return ui;
    });
  };

  /*
   * The following setters are to update local cache. They do not
   * perform any saving to file because all of that is handled by the rpcs.
   */

  const execute: Execute = useCallback(
    async (name, input) => {
      const command = commands[name];
      if (command == null) {
        throw Error(`No command ${name} found.`);
      }

      await command(setUI, input as any);
    },
    [commands, getState]
  );

  return [state, execute, setUI];
}
