import { join } from 'path';

import { Block, Project } from 'ts-morph';

import { BlockAnalyzer } from './block-analyzer';
import { BuildError, printBuildError } from './error';
import { ExecutionGraph } from './models/execution-graph';

export class ExecutionGraphBuilder {
  constructor(private entry: string) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require(join(process.cwd(), entry)); // Ensure the workflow entry is loaded so that the metadata is registered
  }

  build(): ExecutionGraph {
    const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
    const sourceFile = project.getSourceFileOrThrow(this.entry);

    const classDecl = sourceFile.getClasses()[0];
    const className = classDecl.getNameOrThrow();
    const runMethod = classDecl.getMethod('run');
    if (!runMethod) {
      throw new BuildError(`Workflow class "${className}" must have a "run" method.`, this.entry);
    }
    const body = runMethod.getBody() as Block | undefined;
    if (!body) {
      throw new BuildError(
        `"run" method in workflow class "${className}" must have a body.`,
        this.entry,
        runMethod.getStartLineNumber(),
        runMethod.getStart(),
      );
    }

    const graph = new ExecutionGraph(className);
    const analyzer = new BlockAnalyzer(graph, classDecl);

    try {
      analyzer.analyzeBlock(body, true);
      return graph;
    } catch (error) {
      if (error instanceof BuildError) {
        error.filePath = this.entry;
        printBuildError(error);
        throw error;
      }
      throw error;
    }
  }

  // private visitBlock(block: Block, classDecl: ClassDeclaration, insideRun = false) {
  //   for (const stmt of block.getStatements()) {
  //     this.visitStatement(stmt, classDecl, insideRun);
  //   }
  // }

  // private visitStatement(stmt: Statement, classDecl: ClassDeclaration, insideRun: boolean = false) {
  //   if (
  //     insideRun &&
  //     stmt.getKind() === SyntaxKind.ReturnStatement &&
  //     stmt.getFirstChildByKind(SyntaxKind.ExpressionStatement) === undefined
  //   ) {
  //     const successId = `success_${this.nodes.length}`;

  //     const node: ExecutionNode = {
  //       id: successId,
  //       kind: 'success',
  //       next: undefined,
  //       data: {},
  //     };

  //     this.chainNode(node);
  //     return;
  //   }

  //   if (stmt.getKind() === SyntaxKind.IfStatement) {
  //     this.handleIfStatement(stmt as IfStatement, classDecl, insideRun);
  //     return;
  //   }

  //   const call = stmt.getFirstDescendantByKind(SyntaxKind.CallExpression);
  //   if (!call) return;

  //   const expr = call.getExpression();
  //   if (!Node.isPropertyAccessExpression(expr)) return;

  //   const methodName = expr.getName();
  //   const methodDecl = classDecl.getMethod(methodName);
  //   const className = classDecl.getNameOrThrow();

  //   const taskMeta = MetadataRegistry.getTasksForWorkflow(className)?.get(methodName);

  //   if (taskMeta) {
  //     const body = methodDecl?.getBodyText() ?? '';
  //     BuiltInValidators.lambda.validate(
  //       body,
  //       methodDecl as MethodDeclaration,
  //       taskMeta,
  //       this.entry,
  //     );
  //     const node: ExecutionNode = {
  //       id: methodName,
  //       kind: taskMeta.kind,
  //       next: undefined,
  //       data: {
  //         code: methodDecl?.getBodyText() ?? '',
  //         ...(taskMeta.options || {}),
  //       },
  //     };
  //     this.chainNode(node);
  //   } else if (methodDecl) {
  //     const body = methodDecl.getBody();
  //     if (body) {
  //       this.visitBlock(body as Block, classDecl);
  //     }
  //   }
  // }

  // private chainNode(node: ExecutionNode) {
  //   if (this.lastNode) {
  //     this.lastNode.next = node.id;
  //   }
  //   this.nodes.push(node);
  //   this.lastNode = node;
  // }

  // private findNodeById(id: string): ExecutionNode | undefined {
  //   return this.nodes.find((n) => n.id === id);
  // }
}
