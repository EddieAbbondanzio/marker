import { ShortcutState } from "./state";
import { persist } from "@/store/plugins/persist/persist";
import { Shortcut, shortcutFromString } from "@/utils/shortcuts/shortcut";
import { DEFAULT_SHORTCUTS } from "@/utils/shortcuts/default-shortcuts";
import { createComposable, Module } from "vuex-smart-module";
import { ShortcutActions } from "@/store/modules/shortcuts/actions";
import { ShortcutMutations } from "@/store/modules/shortcuts/mutations";
import { ShortcutGetters } from "@/store/modules/shortcuts/getters";

export const shortcuts = new Module({
  namespaced: true,
  actions: ShortcutActions,
  mutations: ShortcutMutations,
  getters: ShortcutGetters,
  state: ShortcutState
});

export const useShortcuts = createComposable(shortcuts);

persist.register({
  namespace: "shortcuts",
  setStateAction: "setState",
  transformer,
  reviver
});

export function transformer(state: ShortcutState): any {
  return {
    values: state.values
      .filter(s => s.wasOverrided)
      .map(s => ({ name: s.name, keys: s.toString() }))
  };
}

export function reviver(state: {
  values: { name: string; keys: string }[];
}): ShortcutState {
  // Parse the loaded shortcuts
  const overrides = state.values.map(s =>
    shortcutFromString(s.name, s.keys, true)
  );

  // Get a copy of the default shortcuts
  const shortcuts = Array.from(DEFAULT_SHORTCUTS);

  // Iterate over the default shortcuts and see if we have an user defined changes to insert
  for (const defaultSC of shortcuts) {
    const overridedSC = overrides.find(s => s.name === defaultSC.name);

    if (overridedSC != null) {
      defaultSC.override(overridedSC.keys);
    }
  }

  // TODO: Add support for custom shortcuts that the user creates, and don't have defaults.

  return {
    values: shortcuts
  };
}