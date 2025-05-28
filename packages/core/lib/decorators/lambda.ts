/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MetadataRegistry } from '../metadata';
import { merge } from '../utils/lodashis';

// interface ClassMethodDecoratorContext {
//   kind: "method";
//   name: string | symbol;
//   static: boolean;
//   private: boolean;
//   addInitializer(initializer: () => void): void;
// }

export interface LambdaTaskOptions {
  /**
   * The name of the Lambda function to invoke.
   * @default the method name
   */
  name?: string;

  /**
   * Description of the Lambda function.
   * @default undefined
   */
  description?: string;

  /**
   * Memory size for the Lambda function in MB.
   * @default 128
   */
  memorySize?: number;

  /**
   * Timeout for the Lambda function in milliseconds.
   * Defaults to 30000 (30 seconds).
   */
  timeout?: number;
}

/**
 * This decorator marks a method as a Lambda task.
 * All code inside this method will become the code of a lambda function.
 * You can pass arguments to the decorator to configure the lambda function.
 * @param options Options for the Lambda task.
 * @returns
 */
export function lambda(options: LambdaTaskOptions = {}) {
  return function (target: any, context: ClassMethodDecoratorContext) {
    context.addInitializer(function (this) {
      // @ts-ignore
      const workflowClass = this.constructor;

      if (!workflowClass || typeof workflowClass !== 'function') {
        throw new Error(`Failed to resolve workflow class for method "${context.name.toString()}"`);
      }

      const defaultLambdaOptions: LambdaTaskOptions = {
        name: context.name.toString(),
        description: undefined,
        memorySize: 128,
        timeout: 30000,
      };

      MetadataRegistry.registerTask({
        workflowClass,
        kind: 'lambda',
        name: context.name.toString(),
        options: merge(defaultLambdaOptions, options),
      });
    });
  };
}
