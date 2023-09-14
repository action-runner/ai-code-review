import { ICodeFile } from "./code.file";

export interface IComment {
  type: string;
  content: string;
  files: ICodeFile[];
}
