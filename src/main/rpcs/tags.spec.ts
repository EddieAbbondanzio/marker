import { createTag } from "../../shared/domain/tag";
import { deserialize, serialize } from "./tags";

test("serialize", () => {
  const tag = createTag({
    name: "Foo",
    dateUpdated: new Date(),
  });

  const [serialized] = serialize([tag]);
  expect(serialized).toHaveProperty("id", tag.id);
  expect(serialized).not.toHaveProperty("type");
  expect(serialized).toHaveProperty("name", "Foo");
  expect(serialized).toHaveProperty("dateCreated");
  expect(serialized).toHaveProperty("dateUpdated");
});

test("deserialize", () => {
  const raw: any = JSON.parse(
    JSON.stringify(createTag({ name: "Foo", dateUpdated: new Date() }))
  );

  const [tag] = deserialize([raw]);
  expect(tag).toHaveProperty("id", raw.id);
  expect(tag).toHaveProperty("type", "tag");
  expect(tag).toHaveProperty("name", "Foo");
  expect(tag.dateCreated).toBeInstanceOf(Date);
  expect(tag.dateUpdated).toBeInstanceOf(Date);
});
