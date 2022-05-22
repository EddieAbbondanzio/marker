/* eslint-disable react-hooks/rules-of-hooks */
import { app, BrowserWindow, ipcMain, Menu, session } from "electron";
import { Config } from "../shared/domain/config";
import { getProcessType, isDevelopment } from "../shared/env";
import { IpcMainTS } from "../shared/ipc";
import { useAppIpcs } from "./ipcs/app";
import {
  loadConfig,
  saveConfig,
  useConfigIpcs as useConfigIpcs,
} from "./ipcs/config";
import { useNoteIpcs } from "./ipcs/notes";
import { useShortcutIpcs } from "./ipcs/shortcuts";
import { useTagIpcs } from "./ipcs/tags";
import { openInBrowser } from "./utils";

if (getProcessType() !== "main") {
  throw Error(
    "ipcMain is null. Did you accidentally import main.ts in the renderer thread?"
  );
}

const DEFAULT_APPLICATION_MENU = Menu.buildFromTemplate([
  { label: "File", enabled: false },
  { label: "Edit", enabled: false },
  { label: "View", enabled: false },
]);

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow;

async function main() {
  const config: Config = await loadConfig();
  const typeSafeIpc: IpcMainTS = {
    handle: (ipc, handler) => {
      ipcMain.handle(ipc, (_, ...args) => handler.apply(handler, args));
    },
  };

  useAppIpcs(typeSafeIpc, config);
  useConfigIpcs(typeSafeIpc, config);
  useShortcutIpcs(typeSafeIpc, config);
  useTagIpcs(typeSafeIpc, config);
  useNoteIpcs(typeSafeIpc, config);

  // Handle creating/removing shortcuts on Windows when installing/uninstalling.
  if (require("electron-squirrel-startup")) {
    app.quit();
  }

  const createWindow = async (): Promise<void> => {
    // Only allow external images
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: Object.assign(
          {
            ...details.responseHeaders,
            "Content-Security-Policy": ["img-src *"],
          },
          details.responseHeaders
        ),
      });
    });

    mainWindow = new BrowserWindow({
      height: config.windowHeight,
      width: config.windowWidth,
      webPreferences: {
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        // Do not change these. They are for security purposes.
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    if (isDevelopment()) {
      mainWindow.webContents.openDevTools();
    }

    mainWindow.on("resize", async () => {
      const [width, height] = mainWindow.getSize();
      config.windowHeight = height;
      config.windowWidth = width;
      await saveConfig(config);
    });

    // Override how all links are open so we can send them off to the user's
    // web browser instead of opening them in the electron app.
    mainWindow.webContents.setWindowOpenHandler((dets) => {
      openInBrowser(dets.url);
      return { action: "deny" };
    });

    // We set a non-functional application menu at first so we can make things
    // appear to load smoother visually. Once renderer has started we'll
    // populate it with an actual menu.
    mainWindow.setMenu(DEFAULT_APPLICATION_MENU);
  };

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

  // Ready event might fire before we finish loading our config file causing us
  // to miss it.
  // Source: https://github.com/electron/electron/issues/12557
  if (app.isReady()) {
    createWindow();
  } else {
    app.on("ready", createWindow);
  }
}
main();
