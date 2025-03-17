export function createFunctionObject<
  P extends Record<string, any>,
  F extends (this: P, ...args: any[]) => any
>(func: F, properties: P): F & P {
  if (typeof func !== "function") {
    throw new TypeError("First argument must be a function");
  }

  const functionObject = Object.assign(
    function (...args: any[]) {
      return func.apply(this, args);
    } as F,
    properties
  ) as F & P;

  const boundFunction = functionObject.bind(functionObject) as F & P;

  return new Proxy(boundFunction, {
    get: (target, prop, receiver) => Reflect.get(target, prop, receiver),
    set: (target, prop, value, receiver) => {
      if (!(prop in Function.prototype)) {
        return Reflect.set(target, prop, value, receiver);
      }
      return false;
    },
    has: (target, prop) => Reflect.has(target, prop),
    ownKeys: (target) =>
      Reflect.ownKeys(target).filter((key) => !(key in Function.prototype)),
  });
}
