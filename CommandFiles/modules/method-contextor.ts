import { cloneAllKeys } from "./callable-obj";

export function MethodContextor<
  M extends object,
  I extends (...args: any[]) => void
>(
  methods: M,
  init: (this: M, ...args: Parameters<I>) => void
): MethodContextor.Result<M, I> {
  const clonedMethods = cloneAllKeys(methods);
  const thisArg = { ...clonedMethods } as M;

  const constructor: (...args: Parameters<I>) => M = (...args) => {
    const instance = Object.create(thisArg);

    for (const [key, value] of Object.entries(thisArg)) {
      if (typeof value === "function") {
        Object.defineProperty(instance, key, {
          value: value.bind(instance),
          writable: true,
          configurable: true,
        });
      }
    }

    init.call(instance, ...args);
    return instance;
  };

  return Object.assign(constructor, thisArg);
}

export namespace MethodContextor {
  export type Result<M, I extends (...args: any[]) => void> = ((
    ...args: Parameters<I>
  ) => M) &
    M;
}

const Car = MethodContextor(
  {
    speed: 0,
    name: "",
    drive(speed: number): string {
      this.speed = speed;
      return `${this.getName()} is driving at ${speed} mph`;
    },
    stop(): string {
      this.speed = 0;
      return `${this.getName()} has stopped`;
    },
    getName(): string {
      return this.name;
    },
    getSpeed(): number {
      return this.speed;
    },
  },
  function (name: string) {
    this.name = name;
    this.speed = 0;
  }
);

const myCar = Car("toyota");
console.log(myCar.drive(60));
console.log(myCar.stop());
console.log(myCar.getName());
console.log(myCar.getSpeed());
console.log(myCar.name);
console.log(myCar.speed);
