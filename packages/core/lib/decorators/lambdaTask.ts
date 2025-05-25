import { MetadataRegistry } from "../metadata";

export interface LambdaTaskOptions {
  // TODO
}

export function lambdaTask(options: LambdaTaskOptions = {}): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    if (!descriptor || typeof descriptor.value !== "function") {
      throw new Error(`@lambdaTask must be used on a method.`);
    }

    MetadataRegistry.registerTask({
      workflowClass: target.constructor,
      kind: "lambda",
      name: propertyKey.toString(),
      options,
    });
  };
}
