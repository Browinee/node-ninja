import fs from "node:fs";
import minimist from "minimist";
import chalk from "chalk";
import { formatTargetDir, write } from "./utils.js";
import prompts from "prompts";
import { Framework, FRAMEWORKS, TEMPLATES } from "./constants.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

interface ArgvProps {
  template?: string;
  help?: boolean;
}

const argv = minimist<ArgvProps>(process.argv.slice(2), {
  alias: {
    t: "template",
    h: "help",
  },
  string: ["_"],
});

const helpMessage = `\
Usage: create-vite [OPTION]... [DIRECTORY]

Create a new Vite project in JavaScript or TypeScript.
With no arguments, start the CLI in interactive mode.

Options:
  -t, --template NAME        use a specific template

Available templates:
${chalk.yellow("vanilla-ts     vanilla")}
${chalk.green("vue-ts         vue")}
${chalk.cyan("react-ts       react")}
${chalk.cyan("react-swc-ts   react-swc")}
${chalk.magenta("preact-ts      preact")}
${chalk.redBright("lit-ts         lit")}
${chalk.red("svelte-ts      svelte")}
${chalk.blue("solid-ts       solid")}
${chalk.blueBright("qwik-ts        qwik")}`;

const defaultTargetDir = "vite-project";

async function init() {
  const argTargetDir = formatTargetDir(argv._[0]);
  const argTemplate = argv.template || argv.t;
  let targetDir = argTargetDir || defaultTargetDir;
  let result: prompts.Answers<"projectName" | "framework" | "variant">;
  try {
    result = await prompts(
      [
        {
          type: argTargetDir ? null : "text",
          name: "projectName",
          message: chalk.reset("Project name:"),
          initial: defaultTargetDir,
          onState: (state) => {
            targetDir = formatTargetDir(state.value) || defaultTargetDir;
          },
        },
        {
          type:
            argTemplate && TEMPLATES.includes(argTemplate) ? null : "select",

          name: "framework",
          message: chalk.reset("Select a framework:"),
          initial: 0,
          choices: FRAMEWORKS.map((framework) => {
            const frameworkColor = framework.color;
            return {
              title: frameworkColor(framework.display || framework.name),
              value: framework,
            };
          }),
        },
        {
          // NOTE:will get the choice from last question in function way.
          type: (framework: Framework) =>
            framework && framework.variants ? "select" : null,
          name: "variant",
          message: chalk.reset("Select a variant:"),
          choices: (framework: Framework) =>
            framework.variants.map((variant) => {
              const variantColor = variant.color;
              return {
                title: variantColor(variant.display || variant.name),
                value: variant.name,
              };
            }),
        },
      ],
      {
        onCancel: () => {
          throw new Error(chalk.red("✖") + " Operation cancelled");
        },
      }
    );
  } catch (cancelled: any) {
    console.log(cancelled.message);
    return;
  }

  console.log("result", result);
  const { framework, variant } = result;

  const root = path.join(process.cwd(), targetDir);

  let template: string = variant || argTemplate;

  console.log(`\nScaffolding project in ${root}...`);

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../..",
    `template/template-${template}`
  );
  console.log("root", root);

  console.log("templateDir", templateDir);

  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  const files = fs.readdirSync(templateDir);

  for (const file of files) {
    write(file, root, templateDir);
  }

  const cdProjectName = path.relative(process.cwd(), root);
  console.log(`cdProjectName`, cdProjectName);
  console.log(`\nDone. Now run:\n`);
  if (root !== process.cwd()) {
    console.log(
      `  cd ${
        cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName
      }`
    );
  }
  console.log(`  npm install`);
  console.log(`  npm run dev`);
  console.log();
}

init().catch((e) => {
  console.error(e);
});
