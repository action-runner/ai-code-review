import { JSONSchema7 } from "json-schema";

export interface PullRequestFunction {
  name: string;
  description: string;
  parameters: JSONSchema7;
}

export interface PullRequestFunctionResponse {
  shouldImprove: boolean;
  comment: string;
  codeSnippet?: string;
  category?: string;
}
