import ansiEscapes from "ansi-escapes";
import EventEmitter from "events";
import readline from "node:readline";

export interface Key {
  name: string;
  sequence: string;
}

let onKeypress: (str: string, key: Key) => void;

export abstract class Prompt extends EventEmitter {
  value = "";
  rl: readline.Interface;

  constructor() {
    super();

    this.rl = readline.createInterface({ input: process.stdin });

    process.stdin.setRawMode(true);

    // Default process.stdin won't emit keypress events
    readline.emitKeypressEvents(process.stdin);
    onKeypress = this.onKeypress.bind(this);
    process.stdin.on("keypress", onKeypress);
  }

  abstract onKeyInput(str: string, key: Key): void;

  private onKeypress(str: string, key: Key) {
    if (key.sequence === "\u0003") {
      process.exit();
    }

    if (key.name === "return") {
      this.close();
      return;
    }
    this?.onKeyInput(str, key);
  }

  close() {
    process.stdout.write("\n");

    process.stdin.removeListener("keypress", onKeypress);
    process.stdin.setRawMode(false);

    this.rl.close();
    this.emit("submit", this.value);
  }
}
