import * as React from "react";
import * as ReactDOM from "react-dom";
import { fontAwesomeLib } from "./libs/fontAwesome";
import { GlobalNavigation } from "./components/GlobalNavigation";
import { Layout } from "./components/Layout";
import { createContext, useEffect, useReducer } from "react";
import { AppState } from "./ui/appState";
import { Execute, generateCommands } from "./commands/index";
import { useKeyboard } from "./keyboard";
import { useFocusables } from "./ui/focusables";
import { Focusable } from "./components/shared/Focusable";

interface AppContext {
  state: AppState;
  execute: Execute;
  // TODO: Theme support
}

fontAwesomeLib();

const state = window.appState.get();
const execute = generateCommands(state);

export const AppContext = createContext<AppContext>({
  state,
  execute,
} as any);

const dom = document.getElementById("app");

if (dom == null) {
  throw Error("No root container to render in");
}

function App() {
  useKeyboard(execute);
  useFocusables();

  return (
    <AppContext.Provider value={{ state, execute }}>
      <Layout>
        <GlobalNavigation />
      </Layout>
    </AppContext.Provider>
  );
}

ReactDOM.render(<App />, dom);
