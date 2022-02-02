import { RpcHandler, RpcRegistry, RpcSchema } from "../../shared/rpc";
import { uuid } from "../../shared/domain/id";
import { createFileHandler } from "../fileSystem";
import * as yup from "yup";
import { getTagSchema, Tag } from "../../shared/domain/tag";
import { EntityType } from "../../shared/domain/types";
import moment from "moment";

const getAllTags = async (): Promise<Tag[]> => tagFile.load();

const createTag: RpcHandler<"tags.create"> = async ({
  name,
}: {
  name: string;
}): Promise<Tag> => {
  const tags = await tagFile.load();
  if (tags.some((t) => t.name === name)) {
    throw Error(`Tag name ${name} already in use`);
  }

  const tag: Tag = {
    id: uuid(),
    type: "tag",
    name,
    dateCreated: new Date(),
  };

  tags.push(tag);
  await tagFile.save(tags);

  return tag;
};

const updateTag = async ({
  id,
  name,
}: {
  id: string;
  name: string;
}): Promise<Tag> => {
  const tags = await tagFile.load();
  if (tags.some((t) => t.name === name && t.id !== id)) {
    throw Error(`Tag name ${name} already in use`);
  }

  const tag = tags.find((t) => t.id === id);
  if (tag == null) {
    throw Error(`No tag with id ${id} found`);
  }

  tag.name = name;
  tag.dateUpdated = new Date();

  await tagFile.save(tags);
  return tag;
};

const deleteTag = async ({ id }: { id: string }): Promise<void> => {
  const tags = await tagFile.load();
  const index = tags.findIndex((t) => t.id === id);
  if (index === -1) {
    throw Error(`No tag with id ${id} found`);
  }

  tags.splice(index, 1);
  await tagFile.save(tags);
};

export const tagRpcs: RpcRegistry<"tags"> = {
  "tags.getAll": getAllTags,
  "tags.create": createTag,
  "tags.update": updateTag,
  "tags.delete": deleteTag,
};

export const serialize = (c: Tag[]) => c.map(({ type, ...t }) => t);

export const deserialize = (c?: Omit<Tag, "type">[]) =>
  (c ?? []).map(({ dateCreated, dateUpdated, ...props }) => {
    const tag = {
      type: "tag",
      ...props,
    } as Tag;

    tag.dateCreated = moment(dateCreated).toDate();
    if (dateUpdated != null) {
      tag.dateUpdated = moment(dateUpdated).toDate();
    }

    return tag;
  });

export const tagFile = createFileHandler<Tag[]>(
  "tags.json",
  yup.array(getTagSchema()).optional(),
  {
    defaultValue: [],
    serialize,
    deserialize,
  }
);
