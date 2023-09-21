import { ICodeFile } from "../types/code.file";
import { IComment } from "../types/comment";
import * as core from "@actions/core";
import { catchAxiosErrorDecorator } from "../decorators/catchAxiosError.decorator";
import { AzureModel, IAzureModel } from "./azure.model";
import {
  SimpleFunction,
  SimpleFunctionPrompt,
} from "./prompt/simpleFunction.prompt";
import { PullRequestFunctionResponse } from "./prompt/function.interface";

export interface IAzureFunctionalModel extends IAzureModel {
  chunkSize: number;
}

export class AzureFunctionalModel extends AzureModel {
  chunkSize: number;
  constructor(args: IAzureFunctionalModel) {
    super(args);
    this.chunkSize = args.chunkSize;
  }
  protected async getPrompt(): Promise<string> {
    return SimpleFunctionPrompt;
  }

  /**
   * Chunk files into groups of `chunkSize`
   * @param chunkSize
   */
  async chunkFiles(chunkSize: number): Promise<ICodeFile[][]> {
    if (this.files.length === 0) {
      return [];
    }

    const chunks: ICodeFile[][] = [];
    for (let i = 0; i < this.files.length; i += chunkSize) {
      chunks.push(this.files.slice(i, i + chunkSize));
    }

    return chunks;
  }

  @catchAxiosErrorDecorator()
  async generateComment(): Promise<IComment[]> {
    if (this.files.length === 0) {
      core.info("No files to generate comment for.");
      return [];
    }

    const chunks = await this.chunkFiles(this.chunkSize);
    const comments: IComment[] = [];
    core.info("Total chunks: " + chunks.length);

    let i = 0;
    for (const chunk of chunks) {
      core.info(`Generating comment for chunk ${i + 1}/${chunks.length}`);
      const promises = chunk.map(async (file) => {
        const prompt = await this.generatePrompt({
          ...file,
        });
        const response = await this.client.post("", {
          messages: [
            {
              role: "system",
              content: prompt,
            },
          ],
          functions: [SimpleFunction],
          function_call: {
            name: SimpleFunction.name,
          },
        });

        const aiResponse = response.data.choices[0].message;
        const functionResponse: PullRequestFunctionResponse = JSON.parse(
          aiResponse.function_call.arguments,
        );
        const comment: IComment = {
          content: functionResponse.comment,
          files: [file],
          type: "comment",
          codeSnippet: functionResponse.codeSnippet,
          category: functionResponse.category,
        };

        return comment;
      });

      const codeFiles = await Promise.allSettled(promises);
      comments.push(
        ...codeFiles
          .filter((c) => c.status === "fulfilled")
          .map((c: any) => c.value),
      );
      i += 1;
    }

    return comments;
  }
}
