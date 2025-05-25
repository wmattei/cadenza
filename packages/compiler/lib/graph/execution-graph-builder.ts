import { join } from 'path';

import { MetadataRegistry } from '@cadenza/core';
import { Block, Project } from 'ts-morph';

import { ExecutionGraph } from '../types';

import { BlockVisitor } from './visitors/block-visitor';
import { BuildError, printBuildError } from './error';

export class ExecutionGraphBuilder {
  constructor(private entry: string) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require(join(process.cwd(), entry)); // Ensure the workflow entry is loaded so that the metadata is registered
  }

  build(): ExecutionGraph {
    const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
    const sourceFile = project.getSourceFileOrThrow(this.entry);

    const classDecl = sourceFile.getClasses()[0]; // TODO search by name or other criteria
    if (!classDecl) {
      throw new Error(`No class found in source file ${this.entry}`);
    }

    const className = classDecl.getNameOrThrow();
    const registeredTasks = MetadataRegistry.getTasksForWorkflow(className);

    const workflowClass = sourceFile.getClassOrThrow('HelloWorkflow');
    const runMethod = workflowClass.getMethodOrThrow('run');
    const body = runMethod.getBodyOrThrow() as Block;

    const visitor = new BlockVisitor({
      classDecl,
      taskRegistry: registeredTasks,
    });

    try {
      const graph = visitor.visit(body);

      return {
        workflowName: className,
        nodes: graph,
      };
    } catch (err) {
      if (err instanceof BuildError) {
        printBuildError(err);
      }
      throw err;
    }
  }
}
