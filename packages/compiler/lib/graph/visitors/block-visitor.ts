import { Block, ClassDeclaration, Statement, SyntaxKind } from "ts-morph";
import { ExecutionNode } from "../../types";
import { AnalyzerContext, CallAnalyzer } from "../analyzers/call-analyzer";

export class BlockVisitor {
  private nodes: ExecutionNode[] = [];
  private lastTaskId: string | null = null;
  private callAnalyzer: CallAnalyzer;

  constructor(private context: AnalyzerContext) {
    this.callAnalyzer = new CallAnalyzer(this.context);
  }

  visit(block: Block): ExecutionNode[] {
    for (const stmt of block.getStatements()) {
      this.visitStatement(stmt);
    }
    return this.nodes;
  }

  private visitStatement(stmt: Statement) {
    const call = stmt.getFirstDescendantByKind(SyntaxKind.CallExpression);
    if (!call) return;

    const result = this.callAnalyzer.analyze(call);

    if (result?.type === "decoratedMethod") {
      this.nodes.push({
        id: result.name,
        dependsOn: this.lastTaskId ? [this.lastTaskId] : [],
        code: result.body,
        kind: result.kind!,
      });
      this.lastTaskId = result.name;
    }

    if (result?.type === "method") {
      this.visit(result.bodyBlock);
    }
  }
}
