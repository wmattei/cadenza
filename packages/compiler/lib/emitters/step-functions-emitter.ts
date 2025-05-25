import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { NodeEmitterRegistry } from "./node-emitter-registry";
import { ExecutionGraph } from "../types";

export class StepFunctionsEmitter {
  emit(scope: Construct, graph: ExecutionGraph): sfn.StateMachine {
    const states: Record<string, sfn.INextable & sfn.IChainable> = {};

    for (const node of graph.nodes) {
      const emitter = NodeEmitterRegistry.get(node.kind);
      states[node.id] = emitter.emit(scope, node);
    }

    const wired = new Set<string>();

    for (const node of graph.nodes) {
      if (!node.dependsOn || node.dependsOn.length === 0) continue;

      for (const parentId of node.dependsOn) {
        if (!states[parentId]) {
          throw new Error(
            `Dependency "${parentId}" for task "${node.id}" not found`
          );
        }

        // Only call .next() once per parent
        if (!wired.has(parentId)) {
          states[parentId].next(states[node.id]);
          wired.add(parentId);
        }
      }
    }

    const rootNode = graph.nodes.find(
      (n) => !n.dependsOn || n.dependsOn.length === 0
    );
    if (!rootNode) throw new Error("No root node found");

    const definition = states[rootNode.id];

    return new sfn.StateMachine(scope, graph.workflowName, {
      definitionBody: sfn.DefinitionBody.fromChainable(definition),
    });
  }
}
