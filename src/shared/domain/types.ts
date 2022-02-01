import { Note } from "./note";
import { Notebook } from "./notebook";
import { Tag } from "./tag";

export interface Entity<Type extends EntityType> {
  id: string;
  type: Type;
  dateCreated: Date;
  dateUpdated?: Date;
}
export type EntityType = "tag" | "notebook" | "note";

export function isTag(t: any): t is Tag {
  return t.type === "tag";
}

export function isNotebook(n: any): n is Notebook {
  return n.type === "notebook";
}

export function isNote(n: any): n is Note {
  return n.type === "note";
}