import chalk from 'chalk';

export class BuildError extends Error {
  name: string = 'GraphBuildError';
  constructor(
    public readonly message: string,
    public readonly filePath: string,
    public readonly line: number,
    public readonly column: number,
    public readonly snippet?: string,
    public readonly hint?: string,
  ) {
    super(message);
  }
}

export function printBuildError(err: BuildError) {
  const location = `${err.filePath}:${err.line}:${err.column}`;

  console.error('\n' + chalk.red.bold('🚨 Cadenza Build Error'));
  console.error(chalk.gray('→') + ' ' + chalk.bold(location) + '\n');

  if (err.snippet) {
    console.error(chalk.gray(`${err.line - 1} | ...`));
    console.error(`${chalk.gray(err.line + ' |')} ${err.snippet}`);
    console.error(' '.repeat(err.column + 4) + chalk.red.bold('^^^'));
  }

  console.error(`\n${chalk.red('✖')} ${chalk.bold(err.message)}`);

  if (err.hint) {
    console.error(`\n${chalk.yellow('💡 Suggestion:')} ${chalk.yellow(err.hint)}\n`);
  }
}
