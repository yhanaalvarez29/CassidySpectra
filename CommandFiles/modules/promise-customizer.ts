/**
 * A mapping of modifier names to functions that can transform or augment promise behavior.
 */
export type ModifierMap = Record<string, (...args: any[]) => any>;

/**
 * A promise subclass that allows attaching custom modifiers to enhance its behavior.
 * @template T The type of the value the promise resolves to.
 * @author lianecagara https://github.com/lianecagara
 */
export class EnhancedPromise<T> extends Promise<T> {
  public modifiers: Record<string, any> = {};
  public customizer: ModifierMap;
  private executor: (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void,
    modifiers: Record<string, any>
  ) => void;
  public isExecutorStarted: boolean = false;
  public resolve!: (value: T | PromiseLike<T>) => void;
  public reject!: (reason?: any) => void;

  constructor(
    customizer: ModifierMap,
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void,
      modifiers: Record<string, any>
    ) => void
  ) {
    super((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    this.customizer = customizer;
    this.executor = executor;
  }

  /**
   * Lazily starts the executor when a promise method is called.
   * @private
   */
  public startExecutor(): void {
    if (!this.isExecutorStarted) {
      this.isExecutorStarted = true;
      this.executor(this.resolve, this.reject, this.modifiers);
    }
  }

  /**
   * Handles fulfillment and rejection of the promise.
   * @template TResult1 The type of the fulfilled result.
   * @template TResult2 The type of the rejected result.
   */
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    this.startExecutor();
    return super.then(onfulfilled, onrejected);
  }

  /**
   * Handles rejection of the promise.
   * @template TResult The type of the rejection result.
   */
  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): Promise<T | TResult> {
    this.startExecutor();
    return super.catch(onrejected);
  }

  /**
   * Executes a callback regardless of the promise's outcome.
   */
  finally(onfinally?: (() => void) | null): Promise<T> {
    this.startExecutor();
    return super.finally(onfinally);
  }

  /**
   * Creates an EnhancedPromise with custom modifiers.
   * @template T The type of the value the promise resolves to.
   * @param customizer A map of modifier functions.
   * @param executor The promise executor function.
   * @returns An EnhancedPromise instance with attached modifiers.
   */
  static create<T>(
    customizer: ModifierMap,
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void,
      modifiers: Record<string, any>
    ) => void
  ): EnhancedPromise<T> {
    const promise = new EnhancedPromise<T>(customizer, executor);

    for (const key in customizer) {
      if (!(key in promise)) {
        Object.defineProperty(promise, key, {
          value: function (...args: any[]) {
            promise.modifiers[key] = customizer[key](...args);
            return promise;
          },
          writable: false,
          configurable: true,
        });
      }
    }

    return promise;
  }
}

/**
 * Extracts the return types of a ModifierMap as an optional record.
 * @template T The ModifierMap type.
 */
export type ModifierResults<T extends ModifierMap> = {
  [K in keyof T]?: ReturnType<T[K]>;
};

/**
 * A factory class for creating EnhancedPromise instances with a predefined set of modifiers.
 * @template T The type of the modifier map.
 * @author lianecagara https://github.com/lianecagara
 */
export class PromiseEnhancer<T extends ModifierMap> {
  private customizer: T;

  constructor(customizer: T) {
    this.customizer = customizer;
  }

  /**
   * Creates an EnhancedPromise with the configured modifiers.
   * @template P The type of the value the promise resolves to.
   * @param executor The promise executor function.
   * @returns An EnhancedPromise instance.
   */
  create<P>(
    executor: (
      resolve: (value: P) => void,
      reject: (reason?: any) => void,
      custom: ModifierResults<T>
    ) => void
  ): EnhancedPromise<P> {
    return EnhancedPromise.create(this.customizer, executor);
  }
}

/**
 * Example usage of PromiseEnhancer and EnhancedPromise.
 */
export namespace example {
  const CustomPromise = new PromiseEnhancer({
    /**
     * Sets the language modifier.
     * @param l The language code (defaults to "en").
     * @returns The language string.
     */
    lang(l: string = "en") {
      return String(l);
    },
  });

  /**
   * Creates an EnhancedPromise that appends a language code to a message.
   * @param msg The message to process.
   * @returns An EnhancedPromise resolving to the modified message.
   */
  export function processMessage(msg: string): EnhancedPromise<string> {
    return CustomPromise.create<string>((resolve, reject, custom) => {
      if (custom.lang) {
        resolve(msg + custom.lang);
      } else {
        resolve(msg);
      }
    });
  }
}

// Usage example:
// example.processMessage("Hello").lang("fr").then(console.log); // Outputs: "Hellofr"
