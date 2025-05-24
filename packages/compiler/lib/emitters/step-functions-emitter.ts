import { Resource } from "aws-cdk-lib";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { ExecutionGraph } from "../model/ExecutionNode";
import { NodeEmitterRegistry } from "./node-emitter-registry";

export class StepFunctionsEmitter {
  emit(scope: Construct, graph: ExecutionGraph): sfn.StateMachine {
    const states: Record<string, sfn.State> = {};

    for (const node of graph.nodes) {
      const emitter = NodeEmitterRegistry.get(node.kind);
      states[node.id] = emitter.emit(scope, node);
    }

    const definition = Object.values(states)[0];

    return new sfn.StateMachine(scope, graph.workflowName, {
      definition,
    });
  }
}
