import ansiEscapes from "ansi-escapes";
import { Key, Prompt } from "./Prompt.js";
import chalk from "chalk";

export interface TextPromptOptions {
  type: "text";
  name: string;
  message: string;
  errorMsg: string;
}

function isNonPrintableChar(char: string) {
  return /^[\x00-\x1F\x7F]$/.test(char);
}

export class TextPrompt extends Prompt {
  out = process.stdout;
  cursor = 0;

  constructor(private options: TextPromptOptions) {
    super();
  }

  onKeyInput(str: string, key: Key) {
    if (key.name === "backspace") {
      this.cursor--;
      this.value = this.value.slice(0, this.cursor);
    }

    if (!isNonPrintableChar(str)) {
      this.value += str;
      this.cursor++;
    }

    this.render();
  }

  render() {
    this.out.write(ansiEscapes.eraseLine);

    this.out.write(ansiEscapes.cursorTo(0));

    this.out.write(
      [
        chalk.bold(this.options.message),
        chalk.gray("›"),
        " ",
        chalk.blue(this.value),
      ].join("")
    );

    this.out.write(ansiEscapes.cursorSavePosition);
    this.out.write(ansiEscapes.cursorDown(1) + ansiEscapes.cursorTo(0));

    if (this.value === "") {
      this.out.write(chalk.red(this.options.errorMsg));
    } else {
      this.out.write(ansiEscapes.eraseLine);
    }
    this.out.write(ansiEscapes.cursorRestorePosition);
  }
}
