import { a, defineData } from "@aws-amplify/backend";

export const data = defineData({
  schema: a.schema({
    Post: a.model({
      id: a.id(),
      title: a.string(),
      content: a.string(),
    }),
  }),
});
