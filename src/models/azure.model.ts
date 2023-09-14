import { ICodeFile } from "../types/code.file";
import { IComment } from "../types/comment";
import { IModel, Model } from "./model";
import axios, { Axios } from "axios";
import * as core from "@actions/core";
import { catchAxiosErrorDecorator } from "../decorators/catchAxiosError.decorator";

interface Connection {
  endpoint: string;
  key: string;
}

interface AIResponse {
  role: "assistant";
  content: string;
}

interface IAzureModel extends IModel<Connection> {}

export class AzureModel extends Model {
  client: Axios;

  constructor(args: IAzureModel) {
    super(args);
    this.client = axios.create({
      baseURL: args.connection.endpoint,
      headers: {
        "Content-Type": "application/json",
        "api-key": args.connection.key,
      },
    });
  }

  @catchAxiosErrorDecorator()
  async generateComment(): Promise<IComment[]> {
    if (this.files.length === 0) {
      core.info("No files to generate comment for.");
      return [];
    }

    core.info(`Generating comment for ${this.files.length} files...`);
    core.startGroup("File Changes");
    core.info(`${this.files.map((file) => file.filePath).join("\n")}`);
    core.endGroup();

    const response = await this.client.post("", {
      messages: [
        {
          role: "system",
          content: await this.generatePrompt({}),
        },
      ],
    });

    const aiResponse = response.data.choices[0].message;

    return [
      {
        content: aiResponse.content,
        type: "comment",
        files: this.files,
      },
    ];
  }
}
