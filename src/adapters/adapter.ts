export abstract class Adapter<T, C> {
  abstract adapt(args: T): Promise<C>;
}
