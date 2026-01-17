type Constructor<T> = new (...args: unknown[]) => T;

export const toText = (output: unknown): string => {
  if (typeof output === "string") return output;
  if (output && typeof output === "object") {
    const content = (output as { content?: unknown }).content;
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      return content
        .map((entry) =>
          typeof entry === "string" ? entry : JSON.stringify(entry)
        )
        .join("");
    }
  }
  return JSON.stringify(output ?? "");
};

/* Check whether array is of the specified type */
export const isArrayOfType = <T>(
  arr: T[],
  type: Constructor<T> | string
): arr is T[] => {
  return (
    Array.isArray(arr) &&
    arr.every((item): item is T => {
      if (typeof type === "string") {
        return typeof item === type;
      } else {
        return item instanceof type;
      }
    })
  );
};

export const removeTaskPrefix = (input: string): string => {
  // Matches: "Task 1.", "Task 1:", "Task:", "1.", "1:", "1 -", "- 1"
  return input.replace(/^(?:Task\s+\d+[:.-]?|Task[:.]?|-?\d+\s*[:.-])\s*/i, "");
};

export const extractTasks = (
  text: string,
  completedTasks: string[]
): string[] => {
  return extractArray(text)
    .filter(realTasksFilter)
    .filter((task) => !(completedTasks || []).includes(task))
    .map(removeTaskPrefix);
};

export const extractArray = (inputStr: string): string[] => {
  // Match an outer array of strings (including nested arrays)
  const regex = /\[[^\]]*\]/;

  const match = regex.exec(inputStr);
  const firstMatch = match?.[0];

  if (firstMatch) {
    try {
      // Parse the matched string to get the array
      return JSON.parse(firstMatch) as string[];
    } catch (error) {
      console.error("Error parsing the matched array:", error);
    }
  }

  console.warn("Error, could not extract array from inputString:", inputStr);
  return [];
};

// Model will return tasks such as "No tasks added". We should filter these
export const realTasksFilter = (input: string): boolean => {
  const noTaskRegex =
    /^No( (new|further|additional|extra|other))? tasks? (is )?(required|needed|added|created|inputted).*$/i;
  const taskCompleteRegex =
    /^Task (complete|completed|finished|done|over|success).*/i;
  const doNothingRegex = /^(\s*|Do nothing(\s.*)?)$/i;

  return (
    !noTaskRegex.test(input) &&
    !taskCompleteRegex.test(input) &&
    !doNothingRegex.test(input)
  );
};
