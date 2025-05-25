import { Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { describe, it } from "node:test";
import { NodeEmitter, StepFunctionsEmitter } from "../../lib";
import { ExecutionNode, ExecutionNodeKind } from "../../lib/types";
import {
  NodeEmitterRegistry,
  registerDefaultEmitters,
} from "../../lib/emitters/node-emitter-registry";
import { ok } from "assert";

// Dummy emitter just to mock out real Lambda tasks
class MockLambdaNodeEmitter implements NodeEmitter {
  emit(scope: Construct, node: ExecutionNode): sfn.INextable & sfn.IChainable {
    return new sfn.Pass(scope, node.id);
  }
}

describe("StepFunctionsEmitter", () => {
  it("emits a state machine from a simple graph", () => {
    // Setup
    const stack = new Stack();
    const emitter = new StepFunctionsEmitter();

    NodeEmitterRegistry.register("lambda", new MockLambdaNodeEmitter());
    // registerDefaultEmitters();

    const graph = {
      workflowName: "TestWorkflow",
      nodes: [
        {
          id: "taskA",
          kind: "lambda" as ExecutionNodeKind,
          method: () => {},
          dependsOn: [],
        },
        {
          id: "taskB",
          kind: "lambda" as ExecutionNodeKind,
          method: () => {},
          dependsOn: ["taskA"],
        },
      ],
    };

    emitter.emit(stack, graph);

    const template = Template.fromStack(stack);

    template.resourceCountIs("AWS::StepFunctions::StateMachine", 1);

    const smResource = template.findResources(
      "AWS::StepFunctions::StateMachine"
    );
    const smLogicalId = Object.keys(smResource)[0];
    const definition = smResource[smLogicalId].Properties.DefinitionString;

    const definitionStr = JSON.stringify(definition);

    ok(definitionStr.includes("taskA"));
    ok(definitionStr.includes("taskB"));
  });
});
