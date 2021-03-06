import {
  createDirectory,
  deleteDirectory,
  exists as exists,
  readDirectory,
  readFile,
  touch,
  writeFile,
} from "../fileSystem";
import {
  createNote,
  getNoteById,
  getNoteSchema,
  Note,
} from "../../shared/domain/note";
import { UUID_REGEX } from "../../shared/domain";
import { Config } from "../../shared/domain/config";
import { keyBy, partition } from "lodash";
import { IpcPlugin } from "../../shared/ipc";
import { shell } from "electron";
import { parseJSON } from "date-fns";

export const NOTES_DIRECTORY = "notes";
export const METADATA_FILE_NAME = "metadata.json";
export const MARKDOWN_FILE_NAME = "index.md";

// Move this down somewhere better
export async function loadNotes(config: Config): Promise<Note[]> {
  const noteDirPath = config.getPath(NOTES_DIRECTORY);
  if (!exists(noteDirPath)) {
    await createDirectory(noteDirPath);
  }
  const entries = await readDirectory(noteDirPath);
  const notes: Note[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || !UUID_REGEX.test(entry.name)) {
      continue;
    }

    const metadataPath = buildNotePath(config, entry.name, "metadata");
    const meta = await readFile(metadataPath, "json");

    const { dateCreated, dateUpdated, ...remainder } = meta;

    const note = createNote({
      dateCreated: parseJSON(dateCreated),
      dateUpdated: dateUpdated != null ? parseJSON(dateUpdated) : undefined,
      ...remainder,
    });
    await getNoteSchema().validate(note);

    // We don't add children until every note has been loaded because there's a
    // chance children will be loaded before their parent.
    notes.push(note);
  }

  const lookup = keyBy(notes, "id");
  const [roots, children] = partition(notes, (n) => n.parent == null);
  for (const child of children) {
    (lookup[child.parent!].children ??= []).push(child);
  }

  return roots;
}

export const useNoteIpcs: IpcPlugin = (ipc, config) => {
  ipc.handle("notes.getAll", async () => {
    /*
     * Since we can't perform async loads within components we'll build a
     * map of every note we can find in the file system and send it over to the
     * renderer. Then we can do our filtering on the front end.
     */

    const noteDirPath = config.getPath(NOTES_DIRECTORY);
    if (!exists(noteDirPath)) {
      await createDirectory(noteDirPath);
    }

    return loadNotes(config);
  });

  ipc.handle("notes.create", async (name, parent) => {
    const dirPath = config.getPath(NOTES_DIRECTORY);
    if (!exists(dirPath)) {
      await createDirectory(dirPath);
    }

    const note = createNote({
      name,
      parent,
    });

    await saveToFileSystem(config, note);

    return note;
  });

  ipc.handle("notes.updateMetadata", async (id, props) => {
    await assertNoteExists(config, id);

    const metadataPath = buildNotePath(config, id, "metadata");
    const meta = await readFile(metadataPath, "json");

    const { name, parent, sort, ...others } = props;

    if (name != null) {
      meta.name = name;
    }
    // Allow unsetting parent
    if ("parent" in props) {
      meta.parent = parent;
    }

    // Allow unsetting sort
    if ("sort" in props) {
      meta.sort = props.sort;
    }

    // Sanity check to ensure no extra props were passed
    if (Object.keys(others).length > 0) {
      console.warn(
        `ipc notes.updateMetadata does not support keys: ${Object.keys(others)}`
      );
    }

    meta.dateUpdated = new Date();
    delete meta.children;

    await saveToFileSystem(config, meta);
    return getNoteById(await loadNotes(config), meta.id);
  });

  ipc.handle("notes.loadContent", async (id) => {
    await assertNoteExists(config, id);

    const content = await loadMarkdown(config, id);
    return content;
  });

  ipc.handle("notes.saveContent", async (id, content) => {
    await assertNoteExists(config, id);
    await saveMarkdown(config, id, content);
  });

  ipc.handle("notes.delete", async (id) => {
    const notes = await loadNotes(config);
    const note = getNoteById(notes, id);

    const recursive = async (n: Note) => {
      const notePath = buildNotePath(config, note.id);
      await deleteDirectory(notePath);

      for (const child of n.children ?? []) {
        await recursive(child);
      }
    };
    recursive(note);
  });

  ipc.handle("notes.moveToTrash", async (id) => {
    const notes = await loadNotes(config);
    const note = getNoteById(notes, id);

    const recursive = async (n: Note) => {
      const notePath = buildNotePath(config, note.id);
      await shell.trashItem(notePath);

      for (const child of n.children ?? []) {
        await recursive(child);
      }
    };

    recursive(note);
  });
};

export async function assertNoteExists(
  config: Config,
  id: string
): Promise<void> {
  const dirPath = config.getPath(NOTES_DIRECTORY);
  if (!exists(dirPath)) {
    await createDirectory(dirPath);
  }

  const fullPath = config.getPath(NOTES_DIRECTORY, id);
  if (!exists(fullPath)) {
    throw new Error(`Note ${id} was not found in the file system.`);
  }
}

export async function saveToFileSystem(
  config: Config,
  note: Note
): Promise<void> {
  const dirPath = config.getPath(NOTES_DIRECTORY, note.id);
  if (!exists(dirPath)) {
    await createDirectory(dirPath);
  }

  const metadataPath = buildNotePath(config, note.id, "metadata");
  const markdownPath = buildNotePath(config, note.id, "markdown");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  await writeFile(metadataPath, note, "json");
  await touch(markdownPath);
}

export async function loadMarkdown(
  config: Config,
  noteId: string
): Promise<string | null> {
  const markdownPath = buildNotePath(config, noteId, "markdown");
  return (await readFile(markdownPath, "text")) ?? "";
}
export async function saveMarkdown(
  config: Config,
  noteId: string,
  content: string
): Promise<void> {
  const markdownPath = buildNotePath(config, noteId, "markdown");
  return await writeFile(markdownPath, content, "text");
}

export function buildNotePath(
  config: Config,
  noteId: string,
  file?: "markdown" | "metadata"
): string {
  if (file == null) {
    return config.getPath(NOTES_DIRECTORY, noteId);
  }

  switch (file) {
    case "markdown":
      return config.getPath(NOTES_DIRECTORY, noteId, MARKDOWN_FILE_NAME);
    case "metadata":
      return config.getPath(NOTES_DIRECTORY, noteId, METADATA_FILE_NAME);

    default:
      throw new Error(`Can't build path for ${file}`);
  }
}
