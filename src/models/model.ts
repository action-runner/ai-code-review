import { ICodeFile } from "../types/code.file";
import { IComment } from "../types/comment";
import nunjucks from "nunjucks";
import { readFile } from "fs/promises";
import { PROMPT_TEXT } from "./prompt/simple.prompt";

export interface IModel<C> {
  connection: C;
  files: ICodeFile[];
  promptFile?: string;
  ignoreFiles?: string[];
  pullRequest: {
    description: string;
    title: string;
  };
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
      return PROMPT_TEXT;
    }
  }

  protected async generatePrompt(args: {
    [key: string]: any;
  }): Promise<string> {
    nunjucks.configure({ autoescape: false });
    return nunjucks.renderString(await this.getPrompt(), {
      files: this.files,
      pullRequest: this.cleanObjectString(this.args.pullRequest),
      ...args,
    });
  }

  /**
   * Some obj may contain empty string. This function will replace those empty string to word 'empty'.
   * @param obj Some obj
   */
  private cleanObjectString(obj: { [key: string]: any }) {
    for (const [key, value] of Object.entries(obj)) {
      if (value === "") {
        obj[key] = "empty";
      }

      if (typeof value === "object") {
        this.cleanObjectString(value);
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === "object") {
            this.cleanObjectString(item);
          }
        }
      }
    }

    return obj;
  }
}
