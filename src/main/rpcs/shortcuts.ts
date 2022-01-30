import { shortcutSchema } from "../../shared/domain/schemas";
import { Section } from "../../shared/domain/state";
import { Shortcut } from "../../shared/domain/valueObjects";
import { DEFAULT_SHORTCUTS } from "../../shared/io/defaultShortcuts";
import { keyCodesToString, parseKeyCodes } from "../../shared/io/keyCode";
import { RpcRegistry } from "../../shared/rpc";
import { createFileHandler } from "../fileSystem";
import * as yup from "yup";

export interface ShortcutOverride {
  command: string;
  keys?: string;
  disabled?: boolean;
  when?: string;
  repeat?: boolean;
}

export const shortcutRpcs: RpcRegistry<"shortcuts"> = {
  "shortcuts.getAll": () => shortcutFile.load(),
};

export const shortcutFile = createFileHandler<Shortcut[]>(
  "shortcuts.json",
  yup.array(shortcutSchema).optional(),
  {
    defaultValue: DEFAULT_SHORTCUTS,
    serialize: (shortcuts) =>
      shortcuts
        .filter((s) => s.userDefined)
        .map((s) => ({
          ...s,
          keys: keyCodesToString(s.keys),
        })),
    deserialize: (raw: ShortcutOverride[]) => {
      raw ??= [];

      // Is there any redundant keys?
      const duplicates = raw.filter(
        (item, index) => raw.findIndex((i) => i.keys === item.keys) != index
      );

      if (duplicates.length > 0) {
        console.error(
          "Error: Complete list of duplicate shortcuts: ",
          duplicates
        );
        throw Error(`Duplicate shortcuts for keys ${duplicates[0].keys}`);
      }

      /*
       * Custom shortcut uses cases:
       * - Disable an existing shortcut
       * - Modify the keys of an existing shortcut
       * - Modify the "when" of an existing shortuct
       * - Create a new custom shortcut
       */

      const values = [];
      for (const defaultShortcut of DEFAULT_SHORTCUTS) {
        const userOverride = raw.find(
          (s) => s.command === defaultShortcut.command
        );

        let shortcut: Shortcut;

        if (userOverride == null) {
          shortcut = Object.assign({}, defaultShortcut);
        } else {
          // Validate it has keys if it's new.
          if (userOverride.keys == null) {
            throw Error(
              `User defined shortcut for ${userOverride.command} does not have any keys specified`
            );
          }

          shortcut = Object.assign(
            {},
            {
              ...userOverride,
              type: "shortcut",
              keys: parseKeyCodes(userOverride.keys),
              when: userOverride.when as Section,
            }
          );
        }

        values.push(shortcut);
      }
      return values;
    },
  }
);
