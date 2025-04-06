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
  const ownKeys: (keyof R)[] = Object.getOwnPropertyNames(
    result
  ) as (keyof R)[];

  const from = Object.fromEntries(ownKeys.map((i) => [i, result[i]]));
  return Object.assign(safeTarget, from ?? ({} as R));
}
