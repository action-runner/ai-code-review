import { ICodeFile } from "../types/code.file";
import { IComment } from "../types/comment";
import nunjucks from "nunjucks";
import { readFile } from "fs/promises";

export interface IModel<C> {
  connection: C;
  files: ICodeFile[];
  promptFile?: string;
  ignoreFiles?: string[];
}

export abstract class Model {
  private _files: ICodeFile[];
  constructor(private readonly args: IModel<any>) {
    this._files = args.files;
  }

  addFile(file: ICodeFile) {
    this._files.push(file);
  }

  addFiles(files: ICodeFile[]) {
    this._files.push(...files);
  }

  get files() {
    return this._files.filter(
      (file) => !this.args.ignoreFiles?.includes(file.filePath)
    );
  }

  /**
   * Generate comments for the files
   */
  abstract generateComment(): Promise<IComment[]>;

  private async getPrompt(): Promise<string> {
    if (this.args.promptFile) {
      return await readFile(this.args.promptFile, "utf-8");
    } else {
      return `
      You are a software engineer working on a project. You are reviewing a pull request. 
      You should raise questions or concerns about the code. If no issues are found, you should skip the file.
      Your comment should follow the following principles:
      1. Code Quality
      2. Performance
      3. Security
      4. Documentation
      5. Naming conventions
      6. Coding style
      7. Testing
      8. Simplicity
      9. Maintainability
      10. Reusability and readability
      11. Error handling
      12. Logging

      Do not raise question about 'some file is added without any implementation'.

      Code changes are follow:
      {% for file in files %}
      ---start---
      %% File path: {{ file.filePath }} %%
      %% Line start: {{ file.lineStart }} %%
      %% Line end: {{ file.lineEnd }} %%
        {{ file.content }}
      ---end---
      {% endfor %}

      You leave the following comment for each file using the following template:
      \`{file_path}\` (code block in markdown)
      {comment}
      `;
    }
  }

  protected async generatePrompt(args: {
    [key: string]: any;
  }): Promise<string> {
    nunjucks.configure({ autoescape: false });
    return nunjucks.renderString(await this.getPrompt(), {
      files: this.files,
      ...args,
    });
  }
}
