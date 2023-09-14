import { ICodeFile } from "../types/code.file";
import simpleGit, { SimpleGit } from "simple-git";

export class CodeFileAdapter {
  private readonly git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  async adapte(targetBranch: string): Promise<ICodeFile[]> {
    const diff = await this.git.diff([targetBranch]);

    return this.parseDiff(diff);
  }

  private parseDiff(diff: string): ICodeFile[] {
    // first, get change by file from diff
    const changes = diff.split("diff --git");
    // second, parse each change
    // get the file name and the content
    const files = changes
      .filter((change) => change.length > 0)
      .map((change) => {
        const lines = change.split("\n");
        // file name without a/
        const fileName = lines[0].split(" ")[1].replace("a/", "");

        // content should exclude
        //   index e69de29..82593db 100644\n' +
        //   '--- a/src/index.ts\n' +
        //   '+++ b/src/index.ts\n'
        const content = lines.slice(5).join("\n");

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
