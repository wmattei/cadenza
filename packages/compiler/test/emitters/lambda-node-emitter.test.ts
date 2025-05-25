import { Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { describe, it } from "node:test";
import { LambdaNodeEmitter } from "../../lib/emitters/node-emitters/lambda-node-emitter";
import { ExecutionNodeKind } from "../../lib/types";

describe("LambdaNodeEmitter", () => {
  it("emits a lambda function", () => {
    const stack = new Stack();

    new LambdaNodeEmitter().emit(stack, {
      id: "taskA",
      kind: "lambda" as ExecutionNodeKind,
      dependsOn: [],
      data: {
        name: "taskALambda",
        description: "This is Task A",
        timeout: 30,
        memorySize: 128,
        code: "exports.handler = async () => { return 'Hello from Task A'; };",
      },
    });

    const template = Template.fromStack(stack);

    template.resourceCountIs("AWS::Lambda::Function", 1);

    template.hasResourceProperties("AWS::Lambda::Function", {
      Handler: "index.handler",
      Runtime: "nodejs20.x",
      FunctionName: "taskALambda",
      Description: "This is Task A",
      Timeout: 30,
      MemorySize: 128,
      Code: {
        ZipFile:
          "exports.handler = async () => { return 'Hello from Task A'; };",
      },
    });
  });
});
