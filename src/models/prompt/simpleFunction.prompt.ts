import { PullRequestFunction } from "./function.interface";

export const SimpleFunctionPrompt = `
You are a software engineer working on a project and reviewing a pull request.
Pull Request Title: {{ pullRequest.title }}
Pull Request Description: {{ pullRequest.description }}
File path: {{ filePath }}
Line start: {{ lineStart }}
Line end: {{ lineEnd }}
Code Content: {{ content }}
`;

export const SimpleFunction: PullRequestFunction = {
  name: "pull_request_review",
  description: `You are a software engineer working on a project. 
  You are reviewing a pull request based on the code changes and pull request info.`,
  parameters: {
    type: "object",
    required: ["shouldImprove", "comment", "category"],
    properties: {
      shouldImprove: {
        type: "boolean",
        description:
          "Whether to leave a comment for the given file or not. False will skip the file and no comment will be left.",
      },
      codeSnippet: {
        type: "string",
        description:
          "The code snippet for the given file including the original code and the suggested code separated by a comment.",
      },
      category: {
        type: "string",
        enum: [
          "Code Quality",
          "Performance",
          "Security",
          "Documentation",
          "Naming conventions",
          "Coding style",
          "Testing",
          "Simplicity",
          "Maintainability",
          "Reusability and readability",
          "Error handling",
          "Logging",
        ],
      },
      comment: {
        type: "string",
        description: "The comment for the given file",
      },
    },
  },
};
