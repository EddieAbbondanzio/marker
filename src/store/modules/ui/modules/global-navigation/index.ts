import { GlobalNavigationActions } from "@/store/modules/ui/modules/global-navigation/actions";
import { GlobalNavigationGetters } from "@/store/modules/ui/modules/global-navigation/getters";
import { GlobalNavigationMutations } from "@/store/modules/ui/modules/global-navigation/mutations";
import { GlobalNavigationState } from "@/store/modules/ui/modules/global-navigation/state";
import { RecursivePartial } from "@/utils";
import { undo } from "@/store/plugins/undo";
import { createComposable, Module } from "vuex-smart-module";
import { commands } from "@/utils/commands";
import { CreateTagCommand } from "@/utils/commands/global-navigation/create-tag-command";
import { RenameTagCommand } from "@/utils/commands/global-navigation/rename-tag-command";
import { DeleteTagCommand } from "@/utils/commands/global-navigation/delete-tag-command";
import { FocusCommand } from "@/utils/commands/global-navigation/focus-command";
import { ExpandAllCommand } from "@/utils/commands/global-navigation/expand-all-command";
import { CollapseAllCommand } from "@/utils/commands/global-navigation/collapse-all-command";
import { MoveSelectionUpCommand } from "@/utils/commands/global-navigation/move-selection-up-command";
import { MoveSelectionDownCommand } from "@/utils/commands/global-navigation/move-selection-down-command";
import { ScrolDownCommand } from "@/utils/commands/global-navigation/scroll-down-command";
import { ScrolUpCommand } from "@/utils/commands/global-navigation/scroll-up-command";
import { GENERAL_USE_SHORTCUTS, KeyCode, shortcuts } from "@/utils/shortcuts";

export const globalNavigation = new Module({
  namespaced: true,
  actions: GlobalNavigationActions,
  state: GlobalNavigationState,
  mutations: GlobalNavigationMutations,
  getters: GlobalNavigationGetters
});

export const useGlobalNavigation = createComposable(globalNavigation);

undo.registerContext({
  name: "globalNavigation",
  namespace: "ui/globalNavigation",
  setStateTransformer: (state: RecursivePartial<GlobalNavigationState>) => {
    // Nuke out visual state so we don't accidentally overwrite it.
    delete state.width;
    return state;
  }
});

export const GLOBAL_NAVIGATION_COMMANDS = {
  focusGlobalNavigation: FocusCommand,
  globalNavigationCollapseAll: CollapseAllCommand,
  globalNavigationCreateTag: CreateTagCommand,
  globalNavigationDeleteTag: DeleteTagCommand,
  globalNavigationExpandAll: ExpandAllCommand,
  globalNavigationMoveSelectionDown: MoveSelectionDownCommand,
  globalNavigationMoveSelectionUp: MoveSelectionUpCommand,
  globalNavigationRenameTag: RenameTagCommand,
  globalNavigationScrollDown: ScrolDownCommand,
  globalNavigationScrollUp: ScrolUpCommand
};

export type GlobalNavigationCommand = keyof typeof GLOBAL_NAVIGATION_COMMANDS;

commands.register(GLOBAL_NAVIGATION_COMMANDS);

export const GLOBAL_NAVIGATION_SHORTCUTS = {
  focusGlobalNavigation: [KeyCode.Control, KeyCode.Digit1],
  globalNavigationCreateNotebook: [KeyCode.Control, KeyCode.LetterN],
  globalNavigationCreateTag: [KeyCode.Control, KeyCode.LetterT],
  globalNavigationCollapseAll: [KeyCode.Control, KeyCode.Shift, KeyCode.ArrowUp],
  globalNavigationExpandAll: [KeyCode.Control, KeyCode.Shift, KeyCode.ArrowDown]
};

const context = { context: "globalNavigation" };

shortcuts.map<GlobalNavigationCommand>([
  { keys: GLOBAL_NAVIGATION_SHORTCUTS.focusGlobalNavigation, command: "focusGlobalNavigation" },
  { keys: GLOBAL_NAVIGATION_SHORTCUTS.globalNavigationCollapseAll, command: "globalNavigationCollapseAll", ...context },
  { keys: GLOBAL_NAVIGATION_SHORTCUTS.globalNavigationCreateTag, command: "globalNavigationCreateTag", ...context },
  { keys: GLOBAL_NAVIGATION_SHORTCUTS.globalNavigationExpandAll, command: "globalNavigationExpandAll", ...context },
  { keys: GENERAL_USE_SHORTCUTS.moveSelectionDown, command: "globalNavigationMoveSelectionDown", ...context },
  { keys: GENERAL_USE_SHORTCUTS.moveSelectionUp, command: "globalNavigationMoveSelectionUp", ...context },
  { keys: GENERAL_USE_SHORTCUTS.scrollDown, command: "globalNavigationScrollDown", ...context },
  { keys: GENERAL_USE_SHORTCUTS.scrollUp, command: "globalNavigationScrollUp", ...context }
]);
