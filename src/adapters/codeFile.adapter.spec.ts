import { CodeFileAdapter } from "./codeFile.adapter";
import { SimpleGit } from "simple-git";

jest.mock("simple-git");

describe("CodeFileAdapter", () => {
  let adapter: CodeFileAdapter;
  let mockGit: jest.Mocked<SimpleGit>;

  beforeEach(() => {
    mockGit = {
      diff: jest.fn(),
      branchLocal: jest.fn().mockResolvedValue({
        branches: {
          main: {},
        },
      }),
    } as any;
    adapter = new CodeFileAdapter(mockGit);
  });

  describe("adapte", () => {
    it("should return an array of ICodeFile objects", async () => {
      mockGit.diff.mockResolvedValueOnce(
        "diff --git a/file.txt b/file.txt\nindex e69de29..82593db 100644\n--- a/file.txt\n+++ b/file.txt\n@@ -0,0 +1 @@\n+hello world\n"
      );
      const result = await adapter.adapt("main");
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty("filePath", "file.txt");
      expect(result[0]).toHaveProperty("content", "+hello world\n");
      expect(result[0]).toHaveProperty("lineStart", 0);
      expect(result[0]).toHaveProperty("lineEnd", 1);
    });

    it("should return an array of ICodeFile objects if no start or end number", async () => {
      mockGit.diff.mockResolvedValueOnce(
        "diff --git a/file.txt b/file.txt\nindex e69de29..82593db 100644\n--- a/file.txt\n+++ b/file.txt\nb/hello.adapter.ts\n+hello world\n"
      );
      const result = await adapter.adapt("main");
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty("filePath", "file.txt");
      expect(result[0]).toHaveProperty("content", "+hello world\n");
      expect(result[0]).toHaveProperty("lineStart", 0);
      expect(result[0]).toHaveProperty("lineEnd", 0);
    });

    it("should return an array of ICodeFile objects when content only contains 3 lines", async () => {
      mockGit.diff.mockResolvedValueOnce(
          "diff --git a/file.txt b/file.txt\nindex e69de29..82593db 100644\n--- a/file.txt\n+++ b/file.txt"
      );
      const result = await adapter.adapt("main");
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty("filePath", "file.txt");
      expect(result[0]).toHaveProperty("content", "");
      expect(result[0]).toHaveProperty("lineStart", 0);
      expect(result[0]).toHaveProperty("lineEnd", 0);
    });

    it("should return an array of ICodeFile objects if content contains diff --git", async () => {
      mockGit.diff.mockResolvedValueOnce(
        "diff --git a/file.txt b/file.txt\nindex e69de29..82593db 100644\n--- a/file.txt\n+++ b/file.txt\nb/hello.adapter.ts\n+hello world diff --git\n"
      );
      const result = await adapter.adapt("main");
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty("filePath", "file.txt");
      expect(result[0]).toHaveProperty("content", "+hello world diff --git\n");
    });
  });
});
