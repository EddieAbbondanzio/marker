import { BrowserWindow, dialog } from "electron";
import { RpcHandler, RpcRegistry } from "../../shared/rpc";
import { PromptOptions } from "../../shared/ui/promptUser";

const promptUser: RpcHandler<"ui.promptUser"> = async (opts) => {
  const cancelCount = opts.buttons.filter((b) => b.role === "cancel").length;
  const defaultCount = opts.buttons.filter((b) => b.role === "default").length;

  if (cancelCount > 1) {
    throw Error(`${cancelCount} cancel buttons found.`);
  }

  if (defaultCount > 1) {
    throw Error(`${defaultCount} default buttons found.`);
  }

  const returnVal = await dialog.showMessageBox({
    title: opts.title,
    type: opts.type ?? "info",
    message: opts.text,
    buttons: opts.buttons.map((b) => b.text),
  });

  // Return back the button that was selected.
  return opts.buttons[returnVal.response];
};

const openDevTools: RpcHandler<"ui.openDevTools"> = async () => {
  BrowserWindow.getFocusedWindow()?.webContents.openDevTools();
};

const reload: RpcHandler<"ui.reload"> = async () => {
  BrowserWindow.getFocusedWindow()?.webContents.reload();
};

const toggleFullScreen: RpcHandler<"ui.toggleFullScreen"> = async () => {
  const bw = BrowserWindow.getFocusedWindow();

  if (bw == null) {
    return;
  }

  bw.setFullScreen(!bw.isFullScreen());
};

export const promptUserRpcs: RpcRegistry = {
  "ui.promptUser": promptUser,
  "ui.openDevTools": openDevTools,
  "ui.reload": reload,
  "ui.toggleFullScreen": toggleFullScreen,
};