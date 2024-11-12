import { prompt, PromptOptions } from "./index.js";

const questions: PromptOptions[] = [
  {
    message: "你的名字?",
    type: "text",
    name: "name",
    errorMsg: "名字不能为空",
  },
  {
    message: "年龄?",
    type: "text",
    name: "age",
    errorMsg: "年龄不能为空",
  },
  {
    message: "你的班级？",
    type: "select",
    name: "class",
    choices: ["一班", "二班", "三班"],
    errorMsg: "班级不能为空",
  },
];

(async function () {
  const answers = await prompt(questions);
  console.log(answers);
})();
