import { z } from "zod";

/*
 * Schemas are used to parse structured outputs from models.
 * https://js.langchain.com/docs/modules/prompts/output_parsers/
 */

export const respondAction = "Respond";

// Define Zod schemas for output parsing
export const actionSchema = z.object({
  // Enum type currently not supported
  action: z
    .string()
    .describe(`The action to take, either 'Question' or '${respondAction}'`),
  arg: z.string().describe("The argument to the action"),
});

export const tasksSchema = z.array(z.string()).describe("A list of tasks to complete");

