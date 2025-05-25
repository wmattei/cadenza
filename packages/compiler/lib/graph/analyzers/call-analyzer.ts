import { TaskMetadata } from "@cadenza/core";
import { CallExpression, ClassDeclaration, Node } from "ts-morph";

export interface AnalysisResult {
  type: "decoratedMethod" | "method";
  name: string;
  body: string;
  kind?: "lambda" | "fargate";
  bodyBlock?: any;
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
      const method = this.context.classDecl.getMethod(methodName);
      return {
        type: "decoratedMethod",
        name: methodName,
        body: method?.getBodyText() ?? "",
        kind: meta.kind,
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
}
