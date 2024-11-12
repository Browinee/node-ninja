import { SelectPrompt, SelectPromptOptions } from "./SelectPrompt.js";
import { TextPromptOptions, TextPrompt } from "./TextPrompt.js";

export type PromptOptions = TextPromptOptions | SelectPromptOptions;

const map: Record<string, any> = {
  text: TextPrompt,
  select: SelectPrompt,
};

async function runPrompt(question: PromptOptions) {
  const promptClass = map[question.type];

  if (!promptClass) {
    return null;
  }

  return new Promise((resolve) => {
    const prompt = new promptClass(question);

    prompt.render();

    prompt.on("submit", (answer: string) => {
      resolve(answer);
    });
  });
}

export async function prompt(questions: PromptOptions[]) {
  const answers: Record<string, any> = {};
  for (const question of questions) {
    const name = question.name;
    answers[name] = await runPrompt(question);
  }
  return answers;
}
