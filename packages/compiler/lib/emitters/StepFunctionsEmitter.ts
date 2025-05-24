import { StateMachineEmitter } from "./StateMachineEmitter";
import { ExecutionGraph } from "../model/ExecutionNode";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";

export class StepFunctionsEmitter implements StateMachineEmitter {
  emit(graph: ExecutionGraph, scope: Construct): sfn.StateMachine {
    const states: Record<string, sfn.State> = {};

    for (const node of graph.nodes) {
      const task = new sfn.Pass(scope, node.id);
      states[node.id] = task;
    }

    const definition = Object.values(states)[0]; // naive start

    return new sfn.StateMachine(scope, graph.workflowName, {
      definition,
    });
  }
}
