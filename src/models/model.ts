import { ICodeFile } from "../types/code.file";
import { IComment } from "../types/comment";

export interface IModel<C> {
  connection: C;
  files: ICodeFile[];
}

export abstract class Model {
  abstract files: ICodeFile[];
  constructor(args: IModel<any>) {}

  /**
   * Generate comments for the files
   */
  abstract generateComment(): Promise<IComment[]>;
}
