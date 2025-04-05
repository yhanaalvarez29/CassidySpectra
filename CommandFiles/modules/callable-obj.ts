export function createCallable<
  T extends (...args: any[]) => any,
  M extends Record<string, any>
>(main: T, methods: M) {
  return createNamespace(() => methods, main);
}

export function createNamespace<
  T extends Record<string, any> | ((...args: any) => any),
  R
>(callback: (ns: T) => R, target?: T): T & R {
  const safeTarget = target ?? ({} as T);

  const result = callback(safeTarget);
  return Object.assign(safeTarget, result ?? ({} as R));
}
