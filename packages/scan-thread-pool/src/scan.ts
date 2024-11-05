import { cpus } from "node:os";
import { dirname, extname } from "node:path";
import { MessageChannel, MessagePort, Worker } from "node:worker_threads";
import { Subject } from "rxjs";

interface WorkerJob {
  job: "scan";
  value: {
    path: string;
  };
}

export type WorkerMessage =
  | {
      type: "scanResult";
      value: {
        results: Array<{
          path: string;
          isTarget: boolean;
        }>;
        workerId: number;
      };
    }
  | {
      type: "scan";
      value: {
        path: string;
      };
    }
  | {
      type: "startup";
      value: {
        channel: MessagePort;
        id: number;
      };
    };

export class ScanService {
  private index = 0;
  private workers: Worker[] = [];
  private tunnels: MessagePort[] = [];

  startScan(stream$: Subject<string>, path: string) {
    this.initWorkers();
    this.listenEvents(stream$);

    this.addJob({ job: "scan", value: { path } });
  }

  private listenEvents(stream$: Subject<string>) {
    this.tunnels.forEach((tunnel) => {
      tunnel.on("message", (data: WorkerMessage) => {
        this.newWorkerMessage(data, stream$);
      });
    });
  }

  private newWorkerMessage(message: WorkerMessage, stream$: Subject<string>) {
    const { type, value } = message;

    if (type === "scanResult") {
      const results: Array<{ path: string; isTarget: boolean }> = value.results;

      results.forEach((result) => {
        const { path, isTarget } = result;
        if (isTarget) {
          stream$.next(path);
        } else {
          this.addJob({
            job: "scan",
            value: { path },
          });
        }
      });
    }
  }

  private getWorkerPath() {
    const actualFilePath = import.meta.url;
    const dirPath = dirname(actualFilePath);
    const extension = extname(actualFilePath);
    const workerName = "scan.worker";
    const url = new URL(`${dirPath}/${workerName}${extension}`);
    // console.log("url", url);

    return url;
  }

  private initWorkers() {
    const size = this.getPoolSize();
    for (let i = 0; i < size; i++) {
      const { port1, port2 } = new MessageChannel();
      const worker = new Worker(this.getWorkerPath());

      worker.postMessage(
        {
          type: "startup",
          value: {
            channel: port2,
            id: i,
          },
        },
        [port2]
      );

      this.workers.push(worker);
      this.tunnels.push(port1);
    }
  }

  private getPoolSize() {
    return cpus().length;
  }

  private addJob(job: WorkerJob) {
    if (job.job === "scan") {
      const tunnel = this.tunnels[this.index];
      const message: WorkerMessage = { type: "scan", value: job.value };
      tunnel.postMessage(message);
      this.index = this.index >= this.workers.length - 1 ? 0 : this.index + 1;
    }
  }
}
