import {
  PromptOptions,
  PromptButton,
  PromptUser,
} from "../../shared/ui/promptUser";

export const promptUser: PromptUser = async (opts: PromptOptions) => {
  const button: PromptButton = await window.rpc("ui.promptUser", opts);
  return button;
};
