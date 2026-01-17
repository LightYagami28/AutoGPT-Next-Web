import {
  createModel,
  startGoalPrompt,
  executeTaskPrompt,
  createTasksPrompt,
  analyzeTaskPrompt,
} from "../utils/prompts";
import type { ModelSettings } from "../utils/types";
import type { PromptTemplate } from "@langchain/core/prompts";
import { env } from "../env/client.mjs";
import { extractTasks, toText } from "../utils/helpers";
import { Serper } from "./custom-tools/serper";

const runPrompt = async (
  prompt: PromptTemplate<any, any>,
  variables: Record<string, unknown>,
  modelSettings: ModelSettings
) => {
  const model = createModel(modelSettings);
  const formatted = await prompt.format(variables);
  const output = await model.invoke(formatted);
  return toText(output);
};

async function startGoalAgent(
  modelSettings: ModelSettings,
  goal: string,
  customLanguage: string
) {
  const completionText = await runPrompt(
    startGoalPrompt,
    {
      goal,
      customLanguage,
    },
    modelSettings
  );
  console.log("Goal", goal, "Completion:" + completionText);
  return extractTasks(completionText, []);
}

async function analyzeTaskAgent(
  modelSettings: ModelSettings,
  goal: string,
  task: string
) {
  const actions = ["reason", "search"];
  const completionText = await runPrompt(
    analyzeTaskPrompt,
    {
      goal,
      actions,
      task,
    },
    modelSettings
  );

  console.log("Analysis completion:\n", completionText);
  try {
    const parsed = JSON.parse(completionText) as unknown;
    if (typeof parsed === "object" && parsed !== null && "action" in parsed && "arg" in parsed) {
      return parsed as Analysis;
    }
    console.warn("Invalid analysis structure, using default");
    return DefaultAnalysis;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Error parsing analysis:", errorMsg);
    return DefaultAnalysis;
  }
}

export type Analysis = {
  action: "reason" | "search";
  arg: string;
};

export const DefaultAnalysis: Analysis = {
  action: "reason",
  arg: "Fallback due to parsing failure",
};

async function executeTaskAgent(
  modelSettings: ModelSettings,
  goal: string,
  task: string,
  analysis: Analysis,
  customLanguage: string
) {
  console.log("Execution analysis:", analysis);

  if (analysis.action === "search" && process.env.SERP_API_KEY) {
    return await new Serper(modelSettings, goal)._call(analysis.arg);
  }

  const completionText = await runPrompt(
    executeTaskPrompt,
    {
      goal,
      task,
      customLanguage,
    },
    modelSettings
  );

  // For local development when no SERP API Key provided
  if (analysis.action === "search" && !process.env.SERP_API_KEY) {
    return `\`ERROR: Failed to search as no SERP_API_KEY is provided in ENV.\` \n\n${completionText}`;
  }

  return completionText;
}

async function createTasksAgent(
  modelSettings: ModelSettings,
  goal: string,
  tasks: string[],
  lastTask: string,
  result: string,
  completedTasks: string[] | undefined,
  customLanguage: string,
) {
  const completionText = await runPrompt(
    createTasksPrompt,
    {
      goal,
      tasks,
      lastTask,
      result,
      customLanguage,
    },
    modelSettings
  );

  return extractTasks(completionText, completedTasks || []);
}

interface AgentService {
  startGoalAgent: (
    modelSettings: ModelSettings,
    goal: string,
    customLanguage: string
  ) => Promise<string[]>;
  analyzeTaskAgent: (
    modelSettings: ModelSettings,
    goal: string,
    task: string
  ) => Promise<Analysis>;
  executeTaskAgent: (
    modelSettings: ModelSettings,
    goal: string,
    task: string,
    analysis: Analysis,
    customLanguage: string,

  ) => Promise<string>;
  createTasksAgent: (
    modelSettings: ModelSettings,
    goal: string,
    tasks: string[],
    lastTask: string,
    result: string,
    completedTasks: string[] | undefined,
    customLanguage: string,
  ) => Promise<string[]>;
}

const OpenAIAgentService: AgentService = {
  startGoalAgent: startGoalAgent,
  analyzeTaskAgent: analyzeTaskAgent,
  executeTaskAgent: executeTaskAgent,
  createTasksAgent: createTasksAgent,
};

const MockAgentService: AgentService = {
  startGoalAgent: async () => ["Task 1"],

  createTasksAgent: async () => ["Task 4"],

  analyzeTaskAgent: async () =>
  ({
    action: "reason",
    arg: "Mock analysis",
  }),

  executeTaskAgent: async (
    modelSettings: ModelSettings,
    goal: string,
    task: string,
    analysis: Analysis,
    customLanguage: string,
  ) => "Result: " + task,
};

export default env.NEXT_PUBLIC_FF_MOCK_MODE_ENABLED
  ? MockAgentService
  : OpenAIAgentService;
