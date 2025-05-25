import { deepEqual, deepStrictEqual, strictEqual } from "assert";
import { beforeEach, describe, it } from "node:test";

import { lambda } from "../../lib/decorators";
import { MetadataRegistry } from "../../lib/metadata";

describe("decorator and MetadataRegistry", () => {
  beforeEach(() => {
    (MetadataRegistry as any).taskMap.clear();
  });

  it("should register lambda tasks with metadata", () => {
    class SampleWorkflow {
      @lambda() process() {}
      @lambda() cleanup() {}
    }

    const tasks = MetadataRegistry.getTasksForWorkflow(SampleWorkflow.name);

    const tasksArray = Array.from(tasks.values());

    strictEqual(tasksArray.length, 2);
    deepStrictEqual(tasksArray.map((t) => t.name).sort(), [
      "cleanup",
      "process",
    ]);
    strictEqual(tasksArray[0].kind, "lambda");
  });

  it("Should register metadata in isolation", () => {
    class A {
      @lambda() one() {}
    }
    class B {
      @lambda() two() {}
    }
    strictEqual(MetadataRegistry.getTasksForWorkflow(A.name).size, 1);
    strictEqual(MetadataRegistry.getTasksForWorkflow(B.name).size, 1);
  });

  it("should return an empty array if no tasks registered", () => {
    class EmptyWorkflow {}
    const tasks = MetadataRegistry.getTasksForWorkflow(EmptyWorkflow.name);
    deepEqual(tasks.size, 0);
  });
});
