import { TaskMetadata } from '@cadenza/core';
import { MethodDeclaration } from 'ts-morph';
import { BuildError } from './error';

export class LambdaDecoratorValidator {
  static validate(
    body: string,
    method: MethodDeclaration,
    _meta: TaskMetadata,
    file?: string,
  ): void {
    if (!body) {
      const line = method.getNameNode().getStartLineNumber();
      const column = method.getNameNode().getStartLinePos();
      throw new BuildError(
        `Method ${method.getName()} has no body.`,
        file,
        line + 1,
        column + 1,
        method.getText(),
        '@lambda must contain a body with logic. Did you forget to implement it?',
      );
    }
  }
}

// TODO make this injectable
export const BuiltInValidators = {
  lambda: LambdaDecoratorValidator,
};
