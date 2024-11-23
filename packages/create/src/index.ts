import fse from 'fs-extra';
import { select, input, confirm } from '@inquirer/prompts';
import {
  NpmPackage,
  versionUtils
} from '@justinlin/utils';
import os from 'node:os';
import path from 'node:path';
import ora from 'ora';
import ejs from 'ejs';
import { glob } from 'glob';

async function create() {

  const projectTemplate = await select({
    message: 'Select project template',
    choices: [
      {
        name: 'React Project',
        value: '@justinlin/template-react'
      },
      {
        name: 'Vue Project',
        value: '@justinlin/template-vue'
      }
    ],
  });

  let projectName = '';
  while (!projectName) {
    projectName = await input({ message: 'Enter project name' });
  }

  const targetPath = path.join(process.cwd(), projectName);

  if (fse.existsSync(targetPath)) {
    const empty = await confirm({ message: 'directory is not empty, remove it?' });
    if (empty) {
      fse.emptyDirSync(targetPath);
    } else {
      process.exit(0);
    }
  }

  const pkg = new NpmPackage({
    targetPath: path.join(os.homedir(), '.justinlin-template'),
    name: projectTemplate
  });

  if (await pkg.exists()) {
    const spinner = ora('Update template.....').start();
    await pkg.update();
    await sleep(1000);
    spinner.stop();
  } else {
    const spinner = ora('Install template.....').start();
    await pkg.install();
    await sleep(1000);
    const templatePath = path.join(pkg.npmFilePath, 'template');
    const targetPath = path.join(process.cwd(), projectName);
    console.log("\n===========");

    console.log("templatePath", templatePath);
    console.log("targetPath", targetPath);

    fse.copySync(templatePath, targetPath);
    spinner.stop();
    const renderData: Record<string, any> = { projectName };
    const deleteFiles: string[] = [];
    // NOTE:路徑要改
    const questionConfigPath = path.join(pkg.npmFilePath, '/template/question.json');
    console.log("questionConfigPath", questionConfigPath);
    console.log("fse.existsSync(questionConfigPath)", fse.existsSync(questionConfigPath));

    if (fse.existsSync(questionConfigPath)) {
      const config = fse.readJSONSync(questionConfigPath);

      for (let key in config) {
        const res = await confirm({ message: 'if open ' + key });
        renderData[key] = res;

        if (!res) {
          deleteFiles.push(...config[key].files)
        }
      }
    }

    console.log("deleteFiles", deleteFiles);

    const files = await glob('**', {
      cwd: targetPath,
      nodir: true,
      ignore: 'node_modules/**'
    })

    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(targetPath, files[i]);
      const renderResult = await ejs.renderFile(filePath, renderData)
      fse.writeFileSync(filePath, renderResult);
    }
    deleteFiles.forEach(item => {
      fse.removeSync(path.join(targetPath, item));
    })
    console.log(`Project created successfully: ${targetPath}`)

  }
}
function sleep(timeout: number) {
  return new Promise((resolve => {
    setTimeout(resolve, timeout);
  }));
}

create();

export default create;
