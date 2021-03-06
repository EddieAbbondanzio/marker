import { KeyCode } from "../io/keyCode";
import * as yup from "yup";
import { UIEventInput, UIEventType } from "../ui/events";
import { Section } from "../ui/app";

/*
 * Shortcuts are not resources because they are considered equal by value.
 * We only test for event and keys for equality.
 */
export interface Shortcut<EType extends UIEventType = UIEventType> {
  // Name is used as a unique identifier so shortcuts can be overrided by the
  // user. Some shortcuts will use the same event (ex: focus.push) so we can't
  // rely on the event to be unique.
  name: string;
  event: EType;
  eventInput?: UIEventInput<EType>;
  keys: KeyCode[];
  disabled?: boolean;
  when?: Section;
  repeat?: boolean;
  userDefined?: boolean;
}

export const shortcutSchema: yup.SchemaOf<Shortcut> = yup.object().shape({
  name: yup.string().required(),
  event: yup.string().required() as any,
  eventInput: yup.mixed().optional(),
  keys: yup.array(),
  disabled: yup.boolean().optional(),
  when: yup.mixed().optional().oneOf(Object.values(Section)),
  repeat: yup.bool().optional(),
  userDefined: yup.bool().optional(),
});
