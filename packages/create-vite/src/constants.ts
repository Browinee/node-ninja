import chalk from "chalk";

export type Framework = {
  name: string;
  display: string;
  color: Function;
  variants: FrameworkVariant[];
};

export type FrameworkVariant = {
  name: string;
  display: string;
  color: Function;
  customCommand?: string;
};

export const FRAMEWORKS: Framework[] = [
  {
    name: "vue",
    display: "Vue",
    color: chalk.green,
    variants: [
      {
        name: "vue-ts",
        display: "TypeScript",
        color: chalk.blue,
      },
      {
        name: "vue",
        display: "JavaScript",
        color: chalk.yellow,
      },
    ],
  },
  {
    name: "react",
    display: "React",
    color: chalk.cyan,
    variants: [
      {
        name: "react-ts",
        display: "TypeScript",
        color: chalk.blue,
      },
      {
        name: "react-swc-ts",
        display: "TypeScript + SWC",
        color: chalk.blue,
      },
      {
        name: "react",
        display: "JavaScript",
        color: chalk.yellow,
      },
      {
        name: "react-swc",
        display: "JavaScript + SWC",
        color: chalk.yellow,
      },
    ],
  },
];

export const TEMPLATES = FRAMEWORKS.map((f) => {
  return f.variants?.map((v) => v.name);
}).reduce((a, b) => {
  return a.concat(b);
}, []);

export const renameFiles: Record<string, any> = {
  _gitignore: ".gitignore",
};
