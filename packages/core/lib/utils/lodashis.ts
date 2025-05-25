export function merge<T>(left: Partial<T>, right: Partial<T>): Partial<T> {
  return {
    ...left,
    ...right,
  };
}
