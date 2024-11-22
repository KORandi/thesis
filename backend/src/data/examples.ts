export interface DataExample {
  role: "user" | "assistant";
  content: string;
}

export const dataExamples: DataExample[] = [
  {
    role: "user",
    content: "[[cursor]] She reached into her bag and pulled out a",
  },
  {
    role: "assistant",
    content:
      "Early that morning, a small leather notebook filled with handwritten notes.",
  },
  {
    role: "user",
    content:
      "The old castle loomed in the distance, its silhouette [[cursor]] against the setting sun.",
  },
  {
    role: "assistant",
    content: "dark and mysterious, casting long shadows over the hills",
  },
  {
    role: "user",
    content: "The baby reached for the shiny [[cursor]] on the table.",
  },
  {
    role: "assistant",
    content: "spoon glinting in the soft afternoon sunlight",
  },
  {
    role: "user",
    content: "He bent down to tie his [[cursor]]",
  },
  {
    role: "assistant",
    content: "worn-out shoelaces, fraying slightly at the edges",
  },
  {
    role: "user",
    content:
      "The meeting adjourned with a unanimous decision to proceed with the new strategy, leaving everyone feeling [[cursor]]",
  },
  {
    role: "assistant",
    content: "relieved and optimistic about the potential for success.",
  },
  {
    role: "user",
    content: "The old typewriter clicked and clacked as he [[cursor]]",
  },
  {
    role: "assistant",
    content: "typed quickly",
  },
  {
    role: "user",
    content: "The clock on the wall [[cursor]]",
  },
  {
    role: "assistant",
    content: "ticked softly",
  },
  {
    role: "user",
    content: "She placed the vase of flowers [[cursor]]",
  },
  {
    role: "assistant",
    content: "on the table",
  },
  {
    role: "user",
    content: "The leaves rustled in the wind, creating a [[cursor]]",
  },
  {
    role: "assistant",
    content: "soft whisper",
  },
  {
    role: "user",
    content: "He adjusted his tie in front of the [[cursor]]",
  },
  {
    role: "assistant",
    content: "mirror",
  },
];
