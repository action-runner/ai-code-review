import { ICodeFile } from "../types/code.file";
import simpleGit, { SimpleGit } from "simple-git";
import { Adapter } from "./adapter";
import * as core from "@actions/core";

export class CodeFileAdapter extends Adapter<string, ICodeFile[]> {
  constructor(private readonly git: SimpleGit = simpleGit()) {
    super();
  }

  async adapt(targetBranch: string): Promise<ICodeFile[]> {
    // get all branches
    const branches = await this.git.branchLocal();
    // check if the target branch exists
    if (branches.branches[targetBranch] === undefined) {
      core.info(`Target branch ${targetBranch} does not exist`);
      core.info(
        `Current local branches are: ${JSON.stringify(branches.branches)}`
      );
      // fetch the target branch
      await this.git.fetch(["origin", `${targetBranch}:${targetBranch}`]);
    }

    const diff = await this.git.diff([targetBranch]);
    return this.parseDiff(diff);
  }

  private parseDiff(diff: string): ICodeFile[] {
    // first, get change by file by splitting start with diff --git
    const changes = diff.split(/^diff --git/gm);
    // second, parse each change
    // get the file name and the content
    const files = changes
      .filter((change) => change.length > 0)
      .map((change) => {
        const lines = change.split("\n");
        // file name without a/
        const fileName = lines[0].split(" ")[1]?.replace("a/", "");

        // content should exclude
        //   index e69de29..82593db 100644\n' +
        //   '--- a/src/index.ts\n' +
        //   '+++ b/src/index.ts\n'
        const content = lines.slice(5).join("\n");

        if (lines[4]?.includes("@@")) {
          const lineNumbers = lines[4].split("@@")[1].split(" ");
          const start = this.cleanNumber(lineNumbers[1].split(",")[0]);
          const end = this.cleanNumber(lineNumbers[2].split(",")[0]);
          const lineContent = lines[4].split("@@")[2];

          return {
            filePath: fileName,
            content:
              lineContent.length > 0 ? lineContent + "\n" + content : content,
            lineStart: start,
            lineEnd: end,
          };
        } else {
          return {
            filePath: fileName,
            content: content,
            lineStart: 0,
            lineEnd: 0,
          };
        }
      });

    return files;
  }

  private cleanNumber(lineNumber: string): number {
    if (lineNumber.includes("+")) {
      return parseInt(lineNumber.replace("+", ""));
    }

    if (lineNumber.startsWith("-") && lineNumber[1] === "0") {
      return 0;
    }

    return parseInt(lineNumber);
  }
}
