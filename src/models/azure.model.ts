import { ICodeFile } from "../types/code.file";
import { IComment } from "../types/comment";
import { IModel, Model } from "./model";
import axios from "axios";

interface Connection {
  endpoint: string;
  key: string;
}

interface IAzureModel extends IModel<Connection> {}

export class AzureModel extends Model {
  files: ICodeFile[];

  constructor(args: IAzureModel) {
    super(args);
    this.files = args.files;
    const client = axios.create({
      baseURL: args.connection.endpoint,
      headers: {
        "Content-Type": "application/json",
        "api-key": args.connection.key,
        
      },
    });
  }

  generateComment(): Promise<IComment[]> {
    throw new Error("Method not implemented.");
  }
}
