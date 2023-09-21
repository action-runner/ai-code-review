import { AzureFunctionalModel } from "./azure.function.model";
describe("AzureFunctionModel", () => {
  it("should return chunks", async () => {
    const files: any[] = Array.from({ length: 10 }, (_, i) => ({
      filePath: `file${i}.txt`,
    }));

    const model = new AzureFunctionalModel({
      chunkSize: 3,
      connection: {
        endpoint: "",
        key: "",
      },
      files: files,
      pullRequest: { description: "", title: "" },
    });

    const chunks = await model.chunkFiles(3);
    expect(chunks.length).toBe(4);
  });

  it("should return chunks", async () => {
    const files: any[] = Array.from({ length: 3 }, (_, i) => ({
      filePath: `file${i}.txt`,
    }));

    const model = new AzureFunctionalModel({
      chunkSize: 3,
      connection: {
        endpoint: "",
        key: "",
      },
      files: files,
      pullRequest: { description: "", title: "" },
    });

    const chunks = await model.chunkFiles(3);
    expect(chunks.length).toBe(1);
  });

  it("should return chunks", async () => {
    const files: any[] = Array.from({ length: 0 }, (_, i) => ({
      filePath: `file${i}.txt`,
    }));

    const model = new AzureFunctionalModel({
      chunkSize: 3,
      connection: {
        endpoint: "",
        key: "",
      },
      files: files,
      pullRequest: { description: "", title: "" },
    });

    const chunks = await model.chunkFiles(3);
    expect(chunks.length).toBe(0);
  });
});
