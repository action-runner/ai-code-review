import { Adapter } from "./adapters/adapter";
import { Model } from "./models/model";
import { ICodeFile } from "./types/code.file";
import * as core from "@actions/core";
import { IComment } from "./types/comment";

interface IRunnerOptions {
  fileAdapter: Adapter<string, ICodeFile[]>;
  processModel: Model;
  outputAdapter: Adapter<IComment[], any>;
}

export class Runner {
  fileAdapter: Adapter<string, ICodeFile[]>;
  processModel: Model;
  outputAdapter: Adapter<IComment[], any>;

  constructor(options: IRunnerOptions) {
    this.fileAdapter = options.fileAdapter;
    this.processModel = options.processModel;
    this.outputAdapter = options.outputAdapter;
  }

  async run(targetBranch: string): Promise<void> {
    const files = await this.fileAdapter.adapt(targetBranch);
    this.processModel.addFiles(files);
    const comments = await this.processModel.generateComment();
    if (comments.length > 0) {
      const output = await this.outputAdapter.adapt(comments);
      core.startGroup("Generated output");
      core.info(output);
      core.endGroup();
      if (typeof output === "string") {
        core.setOutput("comments", output);
        return;
      }
      core.error("This type of output is not supported yet.");
    }
  }
}
