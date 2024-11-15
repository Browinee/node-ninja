import blessed from "blessed";
import contrib from "blessed-contrib";
import CpuMonitor from "./monitor/cpu.js";
import MemoryMonitor from "./monitor/memory.js";
import NetworkMonitor from "./monitor/network.js";
import DiskMonitor from "./monitor/disk.js";
import ProcessMonitor from "./monitor/process.js";

const screen = blessed.screen({
  fullUnicode: true,
});

const grid = new contrib.grid({
  rows: 12,
  cols: 12,
  screen,
});

const cupLineChart = grid.set(0, 0, 4, 12, contrib.line, {
  label: "CPU Usage",
  showLegend: true,
});
const memLineChart = grid.set(4, 0, 4, 8, contrib.line, {
  label: "Memory and Swap  Usage",
  showLegend: true,
});
const memDonut = grid.set(4, 8, 2, 4, contrib.donut, {
  radius: 5,
  arcWidth: 3,
  label: "Memory Usages",
});

const swapDonut = grid.set(6, 8, 2, 4, contrib.donut, {
  radius: 8,
  arcWidth: 3,
  label: "Swap Usage",
});

const netSpark = grid.set(8, 0, 2, 6, contrib.sparkline, {
  label: "Network Usage",
  tags: true,
  style: {
    fg: "blue",
  },
});

const diskDonut = grid.set(10, 0, 2, 6, contrib.donut, {
  radius: 4,
  arcWidth: 2,
  label: "Disk Usage",
});

const processTable = grid.set(8, 6, 4, 6, contrib.table, {
  keys: true,
  label: "Process List",
  columnSpacing: 1,
  columnWidth: [7, 24, 7, 7],
});

processTable.focus();

screen.render();

screen.key("C-c", function () {
  screen.destroy();
});

new CpuMonitor(cupLineChart).init()

new MemoryMonitor(memLineChart, memDonut, swapDonut).init()
new NetworkMonitor(netSpark).init()
new DiskMonitor(diskDonut).init()
new ProcessMonitor(processTable).init();
