import { dialog } from "electron";
import { IpcHandler } from "..";
import { PromptOptions } from "./common";

export const promptUser: IpcHandler<PromptOptions> = async (opts) => {
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