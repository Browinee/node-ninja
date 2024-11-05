import { MessagePort, parentPort } from "node:worker_threads";
import { WorkerMessage } from "./scan.js";
import { opendir } from "node:fs/promises";
import { Dir, Dirent } from "node:fs";
import EventEmitter from "node:events";
import { join } from "node:path";

(() => {
  let id = 0;
  let fileWalker: FileWalker;
  let tunnel: MessagePort;

  if (parentPort === null) {
    throw new Error("Worker 只能被 parent thread 啟動，不能單獨跑");
  }
  parentPort.on("message", (message: WorkerMessage) => {
    if (message.type === "startup") {
      id = message.value.id;
      tunnel = message.value.channel;

      fileWalker = new FileWalker();

      initTunnelListeners();
      initFileWalkerListeners();
    }
  });

  function initTunnelListeners(): void {
    tunnel.on("message", (message: WorkerMessage) => {
      if (message?.type === "scan") {
        fileWalker.enqueueTask(message.value.path);
      }
    });
  }

  function initFileWalkerListeners(): void {
    fileWalker.events.on("newResult", ({ results }) => {
      tunnel.postMessage({
        type: "scanResult",
        value: { results },
      });
    });
  }
})();

interface Task {
  path: string;
}

class FileWalker {
  readonly events = new EventEmitter();
  private readonly taskQueue: Task[] = [];

  enqueueTask(path: string) {
    this.taskQueue.push({ path });
    this.processQueue();
  }

  private processQueue() {
    while (this.taskQueue.length > 0) {
      const path = this.taskQueue.shift()?.path;

      if (path === undefined || path === "") {
        return;
      }

      this.run(path);
    }
  }

  private async run(path: string) {
    try {
      const dir = await opendir(path);
      await this.analizeDir(path, dir);
    } catch (_) {}
  }

  private async analizeDir(path: string, dir: Dir) {
    const results: Array<Record<string, any>> = [];
    // console.log("path", path);
    // console.log("dir", dir);

    let entry: Dirent | null = null;
    while ((entry = await dir.read().catch(() => null)) != null) {
      this.newDirEntry(path, entry, results);
    }

    this.events.emit("newResult", { results });

    await dir.close();
  }

  private newDirEntry(path: string, entry: Dirent, results: any[]): void {
    const subpath = join(path, entry.name);
    const shouldSkip = !entry.isDirectory();
    if (shouldSkip) {
      return;
    }

    results.push({
      path: subpath,
      isTarget: entry.name === "node_modules",
    });
  }
}
