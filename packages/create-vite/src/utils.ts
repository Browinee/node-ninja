import fs from "node:fs";
import path from "path";
import { renameFiles } from "./constants.js";

export const formatTargetDir = (targetDir: string | undefined) => {
  return targetDir?.trim().replace(/\/+$/g, "");
};

export const write = (
  file: string,
  root: string,
  templateDir: string,
  content?: string
) => {
  const targetPath = path.join(root, renameFiles[file] ?? file);
  if (content) {
    fs.writeFileSync(targetPath, content);
  } else {
    copy(path.join(templateDir, file), targetPath);
  }
};

export const copyDir = (srcDir: string, destDir: string) => {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
};

export const copy = (src: string, dest: string) => {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
};
