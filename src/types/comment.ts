import { ICodeFile } from "./code.file";

export interface IComment {
  type: "comment" | "annotation";
  content: string;
  files: ICodeFile[];
  category?: string;
  codeSnippet?: string;
}
