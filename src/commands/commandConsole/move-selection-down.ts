import { store } from "@/store";
import { commandConsole } from "@/store/modules/ui/modules/commandConsole";
import { Command } from "../types";

export class MoveSelectionDown extends Command<void> {
  async execute(): Promise<void> {
    // const ctx = commandConsole.context(store);
    // ctx.actions.moveSelectionDown();
  }
}