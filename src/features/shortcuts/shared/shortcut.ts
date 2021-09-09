import { isModifier, isValidKeyCode, KeyCode } from '@/features/shortcuts/shared/key-code';
import _, { trim } from 'lodash';

export const SHORTCUT_STRING_DELIMITER = '+';

export class Shortcut {
    get keys(): ReadonlyArray<KeyCode> {
        return this._keys;
    }

    public wasOverrided = false;

    private _keys: KeyCode[];

    constructor(public name: string, keys: ReadonlyArray<KeyCode>) {
        this._keys = this._sortKeys(keys);
    }

    override(keys: ReadonlyArray<KeyCode>) {
        this._keys = this._sortKeys(keys);
        this.wasOverrided = true;
    }

    isMatch(activeKeys: KeyCode[]) {
        // Check for the same amount of keys first
        if (activeKeys.length !== this.keys.length) {
            return false;
        }

        // XOR will return elements in one, but not the other. So if we have none returned we have a match!
        return _.xor(this.keys, activeKeys).length === 0;
    }

    toString() {
        return this.keys.join(SHORTCUT_STRING_DELIMITER);
    }

    _sortKeys(keys: ReadonlyArray<KeyCode>): KeyCode[] {
        if (keys.length === 0) {
            throw Error('Shortcut must have at least 1 key');
        }

        if (new Set(keys).size !== keys.length) {
            throw Error('Duplicate keys detected in shortcut');
        }

        const shortcutKeys: KeyCode[] = [];

        const [modifiers, normalKeys] = _.partition(keys, isModifier);

        // Map the values in the array into an object for O(1) lookup.
        const modifierFlags = modifiers.reduce(
            (accumulator: any, modifier) => ({ ...accumulator, [modifier]: true }),
            {}
        );

        /*
         * Modifiers should always be first, and in a specific order.
         */

        if (modifierFlags.control) {
            shortcutKeys.push(KeyCode.Control);
        }

        if (modifierFlags.shift) {
            shortcutKeys.push(KeyCode.Shift);
        }

        if (modifierFlags.alt) {
            shortcutKeys.push(KeyCode.Alt);
        }

        // Add the rest of the keys. These can be in any order.
        shortcutKeys.push(...normalKeys);

        return shortcutKeys;
    }
}

/**
 * Parse a shortcut string literal into it's original form. Throws if invalid.
 * @param shortcutString The shortcut string to parse.
 * @returns The extracted shortcut.
 */
export function shortcutFromString(name: string, shortcutString: string, isUserDefined = false): Shortcut {
    // Split up the keys, and remove any duplicates.
    const rawKeys = _.uniq(shortcutString.split(SHORTCUT_STRING_DELIMITER));
    const keys: KeyCode[] = [];

    for (const key of rawKeys) {
        const trimmedKey = key.trim();

        if (!isValidKeyCode(trimmedKey)) {
            throw Error(`Invalid key code: ${trimmedKey}`);
        }

        keys.push(trimmedKey);
    }

    return new Shortcut(name, keys);
}