import { Adapter } from "./adapter";
import { IComment } from "../types/comment";
import nunjucks from "nunjucks";
import path from "path";

const template = `## Pull Request Review
{% for comment in comments %}
### \`{{ comment.files[0].filePath }}\`
> **{{ comment.category }}** - {{ comment.content }}
{{ comment.codeSnippet }}
{% endfor %}
`;

export class PrCommentFunctionalAdapter extends Adapter<IComment[], string> {
  async adapt(comments: IComment[]): Promise<string> {
    nunjucks.configure({ autoescape: false });
    const refinedComments = comments
      .filter((c) => c.content)
      .map((comment) => {
        const language = path
          .extname(comment.files[0].filePath)
          .replace(".", "");

        const shouldNotUseCodeSnippet =
          comment.codeSnippet &&
          comment.codeSnippet.startsWith("```") &&
          comment.codeSnippet.endsWith("```");

        if (shouldNotUseCodeSnippet) {
          return comment;
        }

        return {
          ...comment,
          codeSnippet: comment.codeSnippet
            ? `\`\`\`${language}\n${comment.codeSnippet}\n\`\`\``
            : undefined,
        };
      });

    return nunjucks.renderString(template, {
      comments: refinedComments,
    });
  }
}
