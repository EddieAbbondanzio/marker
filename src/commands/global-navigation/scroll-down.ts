import { store } from "@/store";
import { globalNavigation } from "@/store/modules/ui/modules/global-navigation";
import { Command } from "../command";

export class ScrolDown extends Command<void> {
  async execute(): Promise<void> {
    const ctx = globalNavigation.context(store);
    ctx.actions.scrollDown();
  }
}