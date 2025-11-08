import { defineType } from "sanity";

export default defineType({
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Event Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "text",
    },
    {
      name: "date",
      title: "Event Date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "flyer",
      title: "Flyer Image",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "link",
      title: "Registration / Info Link",
      type: "url",
    },
  ],
});
