import { MetadataRegistry } from "../metadata";

export interface LambdaTaskOptions {
  // TODO
}

export function lambdaTask(options: LambdaTaskOptions = {}) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const ctor = target.constructor;
    MetadataRegistry.registerTask({
      workflowClass: ctor,
      kind: "lambda",
      name: key,
      fn: descriptor.value,
      options,
    });
  };
}
