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

  for (const [key, value] of Object.entries(thisArg)) {
    if (typeof value === "function") {
      Object.defineProperty(constructor, key, {
        value: function (thisArg: M, ...args: any[]) {
          return (value as Function).apply(thisArg, args);
        },
        writable: true,
        configurable: true,
      });
    }
  }

  return Object.assign(constructor, thisArg) as MethodContextor.Result<M, I>;
}

export namespace MethodContextor {
  export type Result<M, I extends (...args: any[]) => void> = ((
    ...args: Parameters<I>
  ) => M) & {
    [K in keyof M]: M[K] extends (...args: infer Args) => infer R
      ? (thisArg: M, ...args: Args) => R
      : M[K];
  };
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

const someCar = Car("IDK");
console.log(Car.drive(someCar, 80));
console.log(Car.stop(someCar));
console.log(Car.getName(someCar));
console.log(Car.getSpeed(someCar));
