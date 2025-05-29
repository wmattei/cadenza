import { Block, Project } from 'ts-morph';

import { BlockAnalyzer } from './block-analyzer';
import { BuildError, printBuildError } from './error';
import { ExecutionGraph } from './models/execution-graph';

export class ExecutionGraphBuilder {
  private mod;
  constructor(private entry: string) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    this.mod = require(entry); // Ensure the workflow entry is loaded so that the metadata is registered
  }

  build(): ExecutionGraph {
    const project = new Project({});
    const sourceFile = project.addSourceFileAtPathIfExists(this.entry);
    if (!sourceFile) {
      throw new BuildError(`Workflow entry file "${this.entry}" not found.`, this.entry);
    }

    const classDecl = sourceFile.getClasses()[0];
    const className = classDecl.getNameOrThrow();

    new this.mod[className]();
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
      const root = analyzer.analyzeBlock(body, true);
      graph.root = root;
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
}
