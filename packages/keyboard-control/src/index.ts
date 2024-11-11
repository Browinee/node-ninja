import ansiEscapes from "ansi-escapes";
import { ScrollList } from "./scroll-list.js";
import readline from "node:readline";

readline.emitKeypressEvents(process.stdin);

process.stdin.setRawMode(true);

const list = new ScrollList([
  "紅樓夢",
  "西遊記",
  "水滸傳",
  "三國演義",
  "儒林外史",
  "金瓶梅",
  "聊齋誌異",
  "白鹿原",
  "平凡的世界",
  "圍城",
  "活著",
  "百年孤獨",
  "圍城",
  "紅高粱家族",
  "夢裡花落知多少",
  "傾城之戀",
  "悲慘世界",
  "哈利波特",
  "霍亂時期的愛情",
  "白夜行",
  "解憂雜貨店",
  "挪威的森林",
  "追風箏的人",
  "小王子",
  "飄",
  "麥田裡的守望者",
  "時間簡史",
  "人類簡史",
  "活著為了講述",
  "白夜行",
  "百鬼夜行",
]);

process.stdin.on("keypress", (str, key) => {
  if (key.sequence === "\u0003") {
    process.stdout.write(ansiEscapes.clearTerminal);
    process.exit();
  }

  list.onKeyInput(key.name);
});
