import { KeyCode } from "@/utils/shortcuts/key-code";
import { Shortcut } from "@/utils/shortcuts/shortcut";

const GERNERAL_USE = [
  new Shortcut("escape", [KeyCode.Escape]),
  new Shortcut("delete", [KeyCode.Delete]),
  new Shortcut("enter", [KeyCode.Enter]),
  new Shortcut("toggleSelection", [KeyCode.Space]),
  new Shortcut("moveSelectionUp", [KeyCode.ArrowUp]),
  new Shortcut("moveSelectionDown", [KeyCode.ArrowDown]),
  new Shortcut("scrollUp", [KeyCode.Control, KeyCode.ArrowUp]),
  new Shortcut("scrollDown", [KeyCode.Control, KeyCode.ArrowDown]),
  new Shortcut("undo", [KeyCode.Control, KeyCode.LetterZ]),
  new Shortcut("redo", [KeyCode.Control, KeyCode.LetterY]),
  new Shortcut("rename", [KeyCode.F2])
];

const GLOBAL_NAVIGATION = [
  new Shortcut("focusGlobalNavigation", [KeyCode.Control, KeyCode.Digit1]),
  new Shortcut("globalNavigationCreateNotebook", [
    KeyCode.Control,
    KeyCode.LetterN
  ]),
  new Shortcut("globalNavigationCreateTag", [KeyCode.Control, KeyCode.LetterT]),
  new Shortcut("globalNavigationCollapseAll", [
    KeyCode.Control,
    KeyCode.Shift,
    KeyCode.ArrowUp
  ]),
  new Shortcut("globalNavigationExpandAll", [
    KeyCode.Control,
    KeyCode.Shift,
    KeyCode.ArrowDown
  ])
];

const LOCAL_NAVIGATION = [
  new Shortcut("focusLocalNavigation", [KeyCode.Control, KeyCode.Digit2])
];

const EDITOR = [
  new Shortcut("focusEditor", [KeyCode.Control, KeyCode.Digit3]),
  new Shortcut("editorSave", [KeyCode.Control, KeyCode.LetterS]),
  new Shortcut("editorToggleMode", [KeyCode.Control, KeyCode.LetterE]),
  new Shortcut("editorToggleSplitView", [
    KeyCode.Control,
    KeyCode.Alt,
    KeyCode.LetterS
  ])
];

export const DEFAULT_SHORTCUTS: ReadonlyArray<Shortcut> = [
  ...GERNERAL_USE,
  ...GLOBAL_NAVIGATION,
  ...LOCAL_NAVIGATION,
  ...EDITOR
];