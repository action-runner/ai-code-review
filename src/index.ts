import { CodeFileAdapter } from "./adapters/codeFile.adapter";

(async () => {
  const adapter = new CodeFileAdapter();
  const result = await adapter.adapte("main");
  console.log(result);
})();
