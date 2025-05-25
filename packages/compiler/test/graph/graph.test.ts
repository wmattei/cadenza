import { describe, it } from "node:test";
import { ExecutionGraphBuilder } from "../../lib/graph";
import { deepStrictEqual, strictEqual } from "assert";
import { MetadataRegistry } from "@cadenza/core";

describe.only("ExecutionGraphBuilder", () => {
  it.only("builds a graph from HelloWorkflow", () => {
    // Manually simulate decorator calls (since we're not running decorators at compile time)
    MetadataRegistry.registerTask({
      workflowClass: { name: "HelloWorkflow" } as any,
      kind: "lambda",
      name: "sayHello",
      fn: () => {},
      options: {},
    });

    MetadataRegistry.registerTask({
      workflowClass: { name: "HelloWorkflow" } as any,
      kind: "lambda",
      name: "sayGoodbye",
      fn: () => {},
      options: {},
    });

    const graph = new ExecutionGraphBuilder(
      require.resolve("./fixtures/HelloWorkflow.ts")
    ).build();

    strictEqual(graph.workflowName, "HelloWorkflow");
    strictEqual(graph.nodes.length, 2);

    const ids = graph.nodes.map((n) => n.id).sort();
    deepStrictEqual(ids, ["sayGoodbye", "sayHello"]);

    const sayGoodbye = graph.nodes.find((n) => n.id === "sayGoodbye");
    deepStrictEqual(sayGoodbye?.dependsOn, ["sayHello"]);
  });
});
