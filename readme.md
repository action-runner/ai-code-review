# AI Code Reviewer

## Introduction

This is an AI Code Review Action will add a comment to your pull request when it detects a code review issue.

## Current supported llms:

- Azure OpenAI

## Usage

```yaml
- name: PR
  id: pr
  uses: ./
  with:
    key: ${{ secrets.KEY }}
    endpoint: ${{ secrets.ENDPOINT }}
    ignoreFiles: |
      .github/workflows/pr.yaml
      dist/index.js
- uses: mshick/add-pr-comment@v2
  with:
    message-id: preview-url
    message: ${{ steps.pr.outputs.comments }}
```

You can also provide a prompt file in your repository, and the action will use it to generate the prompt.
The format can use the following variables:

```jinja
{% for file in files %}
  ---start---
  %% File path: {{ file.filePath }} %%
  %% Line start: {{ file.lineStart }} %%
  %% Line end: {{ file.lineEnd }} %%
    {{ file.content }}
  ---end---
{% endfor %}
```
