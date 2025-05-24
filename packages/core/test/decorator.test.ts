import { deepStrictEqual, strictEqual } from "assert";
import { beforeEach, describe, it } from "node:test";
import { lambdaTask } from "../lib/decorators";
import { MetadataRegistry } from "../lib/metadata";

describe("lambdaTask decorator and MetadataRegistry", () => {
  beforeEach(() => {
    (MetadataRegistry as any).taskMap.clear();
  });

  it("should register lambda tasks with metadata", () => {
    class SampleWorkflow {
      @lambdaTask() process() {}
      @lambdaTask() cleanup() {}
    }

    const tasks = MetadataRegistry.getTasksForWorkflow(SampleWorkflow);

    strictEqual(tasks.length, 2);
    deepStrictEqual(tasks.map((t) => t.name).sort(), ["cleanup", "process"]);
    strictEqual(tasks[0].kind, "lambda");
    strictEqual(typeof tasks[0].fn, "function");
  });

  it("Should register metadata in isolation", () => {
    class A {
      @lambdaTask() one() {}
    }
    class B {
      @lambdaTask() two() {}
    }
    strictEqual(MetadataRegistry.getTasksForWorkflow(A).length, 1);
    strictEqual(MetadataRegistry.getTasksForWorkflow(B).length, 1);
  });

  it("should return an empty array if no tasks registered", () => {
    class EmptyWorkflow {}
    const tasks = MetadataRegistry.getTasksForWorkflow(EmptyWorkflow);
    deepStrictEqual(tasks, []);
  });
});
