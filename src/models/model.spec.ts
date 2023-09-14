import { IComment } from "../types/comment";
import { Model } from "./model";

describe("Model", () => {
  it("should respect the ignoreFiles option", () => {
    class TestModel extends Model {
      async generateComment(): Promise<IComment[]> {
        return [];
      }
    }

    const model = new TestModel({
      connection: {},
      files: [],
      ignoreFiles: ["file1", "file2"],
      pullRequest: {
        description: "",
        title: "",
      },
    });

    model.addFile({
      content: "",
      filePath: "file1",
      lineEnd: 0,
      lineStart: 0,
    });

    model.addFile({
      content: "",
      filePath: "file2",
      lineEnd: 0,
      lineStart: 0,
    });

    model.addFile({
      content: "",
      filePath: "file3",
      lineEnd: 0,
      lineStart: 0,
    });

    expect(model.files.length).toBe(1);
  });
});
