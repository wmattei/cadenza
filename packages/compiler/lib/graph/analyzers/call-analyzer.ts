import { TaskMetadata } from "@cadenza/core";
import {
  CallExpression,
  ClassDeclaration,
  MethodDeclaration,
  Node,
} from "ts-morph";

import { BuildError } from "../error";

export interface AnalysisResult {
  type: "decoratedMethod" | "method";
  name: string;
  body: string;
  kind?: "lambda" | "fargate";
  bodyBlock?: Node;
  meta?: TaskMetadata;
}

export interface AnalyzerContext {
  classDecl: ClassDeclaration;
  taskRegistry: Map<string, TaskMetadata>;
}

export class CallAnalyzer {
  constructor(private context: AnalyzerContext) {}

  analyze(call: CallExpression): null | AnalysisResult {
    const expr = call.getExpression();
    if (!Node.isPropertyAccessExpression(expr)) return null;
    if (expr.getExpression().getText() !== "this") return null;

    const methodName = expr.getName();

    if (this.context.taskRegistry.has(methodName)) {
      const meta = this.context.taskRegistry.get(methodName)!;
      const method = this.context.classDecl.getMethod(methodName)!;

      const body = method?.getBodyText() ?? "";
      this.validateMethodBody(body, method, meta);
      return {
        type: "decoratedMethod",
        name: methodName,
        body: body,
        kind: meta.kind,
        meta,
      };
    }

    const method = this.context.classDecl.getMethod(methodName);
    if (method) {
      return {
        type: "method",
        name: methodName,
        body: method.getBodyText() ?? "",
        bodyBlock: method.getBodyOrThrow(),
      };
    }

    return null;
  }

  // TODO custom validation for decorators
  private validateMethodBody(
    body: string,
    method: MethodDeclaration,
    _meta: TaskMetadata
  ) {
    if (!body) {
      const line = method.getNameNode().getStartLineNumber();
      const column = method.getNameNode().getStartLinePos();
      throw new BuildError(
        `Method ${method.getName()} has no body.`,
        this.context.classDecl.getSourceFile().getFilePath(),
        line + 1,
        column + 1,
        method.getText(),
        "Decorated tasks must contain a body with logic. Did you forget to implement it?"
      );
    }
  }
}
