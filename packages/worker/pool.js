const os = require("node:os");
const { Worker, MessageChannel } = require("node:worker_threads");

const poolSize = os.cpus().length;

const workers = [];
const tunnels = [];

for (let i = 0; i < poolSize; i++) {
  const { port1, port2 } = new MessageChannel();
  const worker = new Worker("./pool-worker.js");
  worker.postMessage(
    {
      type: "startup",
      id: i,
      channel: port2,
    },
    [port2]
  );

  tunnels.push(port1);
  workers.push(worker);
}
for (let i = 0; i < tunnels.length; i++) {
  tunnels[i].on("message", (msg) => {
    console.log(`thread ${msg.id} result ${msg.res}`);
  });
}

let curIndex = 0;

function addJob(num) {
  const tunnel = tunnels[curIndex];

  tunnel.postMessage({
    value: num,
  });
  curIndex = curIndex >= workers.length - 1 ? 0 : curIndex + 1;
}

for (let i = 0; i < 100; i++) {
  const countTotal = Math.floor(Math.random() * 1000000);
  addJob(countTotal);
}
