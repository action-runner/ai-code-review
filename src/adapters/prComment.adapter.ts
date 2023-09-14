import { IComment } from "../types/comment";
import { Adapter } from "./adapter";

export class PrCommentAdapter extends Adapter<IComment[], string> {
  async adapt(comments: IComment[]): Promise<string> {
    return comments[0].content;
  }
}
