import * as React from "react";
import * as ReactDOM from "react-dom";
import { fontAwesomeLib } from "./libs/fontAwesome";
import { GlobalNavigation } from "./components/GlobalNavigation";
import { Layout } from "./components/Layout";
import { createContext, useEffect, useReducer } from "react";
import { AppState, useAppState } from "./ui/appState";
import { Execute, useCommands } from "./commands/index";
import { useKeyboard } from "./io/keyboard";
import { useFocusables } from "./ui/focusables";
import { useAsync } from "react-async-hook";
import { sleep } from "../shared/utils/sleep";

interface AppContext {
  state: AppState;
  execute: Execute;
  // TODO: Theme support
}

fontAwesomeLib();

const dom = document.getElementById("app");

if (dom == null) {
  throw Error("No root container to render in");
}

export const AppContext = createContext<AppContext>({
  // Stubs to keep things from blowing up
  state: { globalNavigation: {} },
  execute: () => {},
} as any);

function App() {
  const isFocused = useFocusables();

  const [state, setState] = useAppState();
  const execute = useCommands(state, setState);

  useKeyboard(execute, isFocused);

  return (
    <AppContext.Provider
      value={{
        state,
        execute,
      }}
    >
      <Layout>
        <GlobalNavigation />
      </Layout>
    </AppContext.Provider>
  );
}

ReactDOM.render(<App />, dom);
