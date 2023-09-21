import { CodeFileAdapter } from "./adapters/codeFile.adapter";
import { PrCommentAdapter } from "./adapters/prComment.adapter";
import { AzureModel } from "./models/azure.model";
import * as core from "@actions/core";
import { Runner } from "./runner";
import { AzureFunctionalModel } from "./models/azure.function.model";
import { PrCommentFunctionalAdapter } from "./adapters/prComment.functional.adapter";

function getInput(key: string, defaultValue: string) {
  const value = core.getInput(key);
  if (value.length === 0) {
    return defaultValue;
  }
  return value;
}

(async () => {
  const key = getInput("key", process.env.AZURE_KEY!);
  const endpoint = getInput("endpoint", process.env.AZURE_ENDPOINT!);
  const ignoreFiles = core.getMultilineInput("ignoreFiles");
  const promptFile = core.getInput("promptFile");
  const targetBranch = getInput("targetBranch", "main");
  const prDescription = core.getInput("prDescription");
  const prTitle = core.getInput("prTitle");

  const adapter = new CodeFileAdapter();
  const commentAdapter = new PrCommentFunctionalAdapter();

  const model = new AzureFunctionalModel({
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
    chunkSize: 3,
  });

  const runner = new Runner({
    fileAdapter: adapter,
    processModel: model,
    outputAdapter: commentAdapter,
  });

  await runner.run(targetBranch);
})();
