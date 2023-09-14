import { CodeFileAdapter } from "./adapters/codeFile.adapter";
import { PrCommentAdapter } from "./adapters/prComment.adapter";
import { AzureModel } from "./models/azure.model";
import * as core from "@actions/core";
import { Runner } from "./runner";

(async () => {
  const key = core.getInput("key");
  const endpoint = core.getInput("endpoint");
  const ignoreFiles = core.getMultilineInput("ignoreFiles");
  const promptFile = core.getInput("promptFile");
  const targetBranch = core.getInput("targetBranch");
  const prDescription = core.getInput("prDescription");
  const prTitle = core.getInput("prTitle");

  const adapter = new CodeFileAdapter();
  const commentAdapter = new PrCommentAdapter();

  const model = new AzureModel({
    connection: {
      key,
      endpoint,
    },
    files: [],
    ignoreFiles: [...ignoreFiles, "pnpm-lock.yaml", "package-lock.json"],
    promptFile: promptFile,
    pullRequest: {
      description: prDescription,
      title: prTitle,
    },
  });

  const runner = new Runner({
    fileAdapter: adapter,
    processModel: model,
    outputAdapter: commentAdapter,
  });

  await runner.run(targetBranch);
})();
