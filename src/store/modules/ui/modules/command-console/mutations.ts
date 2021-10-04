import { Mutations } from "vuex-smart-module";
import { CommandConsoleState } from "./state";

export class CommandConsoleMutations extends Mutations<CommandConsoleState> {
  SHOW() {
    this.state.modalActive = true;
  }

  HIDE() {
    this.state.modalActive = false;
  }
}