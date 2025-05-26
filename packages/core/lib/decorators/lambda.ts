import { MetadataRegistry } from '../metadata';
import { merge } from '../utils/lodashis';

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
export function lambda(options: LambdaTaskOptions = {}): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    if (!descriptor || typeof descriptor.value !== 'function') {
      throw new Error(`@lambda must be used on a method.`);
    }

    const defaultLambdaOptions: LambdaTaskOptions = {
      name: propertyKey.toString(),
      description: undefined,
      memorySize: 128,
      timeout: 30000,
    };

    MetadataRegistry.registerTask({
      workflowClass: target.constructor,
      kind: 'lambda',
      name: propertyKey.toString(),
      options: merge(defaultLambdaOptions, options),
    });
  };
}
