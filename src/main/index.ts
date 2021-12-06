import { app, BrowserWindow, ipcMain } from "electron";
import { getNodeEnv, getProcessType } from "../shared/env";
import { RpcType, RpcHandler, RpcArgument, RpcRegistry } from "../shared/rpc";
import { notifyOnReady } from "./events";
import { promptUserRpcs as uiRpcs } from "./rpcs/app";
import { stateRpcs } from "./rpcs/state";

/*
 * Register new handlers here. You'll need to update IpcType too
 */
export const handlers: RpcRegistry = {
  ...uiRpcs,
  ...stateRpcs,
};

if (getProcessType() !== "main") {
  throw Error(
    "ipcMain is null. Did you accidentally call main.ts on the renderer thread?"
  );
}

ipcMain.on("send", async (ev, arg: RpcArgument) => {
  const respond = (value: any) =>
    ev.sender.send("send", {
      id: arg.id,
      type: arg.type,
      value,
    });

  const respondError = (error: Error) => {
    ev.sender.send("send", {
      error,
    });
  };

  const handler = handlers[arg.type as RpcType];

  if (handler == null) {
    respondError(Error("An error has occured."));

    if (getNodeEnv() === "development") {
      console.warn(
        `Main recieved rpc: ${arg.type}
         but no handler was found. Any changes made to main thread code require a restart.`
      );
    }

    return;
  }

  try {
    // Cast is gross
    const res = await handler(arg.value as any);

    respond(res);
  } catch (e) {
    respondError(e);

    console.error(`Caught error from rpc handler for type "${arg.type}"`, e);
    console.error("Rpc argument: ", arg);
  }
});

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = async (): Promise<void> => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  //Notify hooks
  notifyOnReady();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// console.log("RPC handlers loaded.", handlers);
