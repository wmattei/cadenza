import chalk from "chalk";

import { WorkflowBase } from "./WorkflowBase";

export interface DevRunOptions {
  /**
   * If true, prints initial and final state to the console using chalk.
   * Defaults to false.
   */
  debugState?: boolean;
}

/**
 * Executes a Cadenza workflow class locally with the given input.
 *
 * @param Workflow - The workflow class constructor (must extend `CadenzaWorkflow`)
 * @param input - The input to provide to the workflow during development
 * @param options - Optional flags for debug output
 *
 * @example
 * ```ts
 * await devRun(MyWorkflow, { name: "Alice" }, { debugState: true });
 * ```
 */
export async function devRun<TInput>(
  Workflow: new (input: TInput) => WorkflowBase<TInput>,
  input: TInput,
  options: DevRunOptions = {},
): Promise<void> {
  const { debugState = false } = options;

  console.info(chalk.magenta("\n=== 🧪 Running Cadenza Workflow ==="));

  const wf = new Workflow(input);

  if (debugState) {
    console.info(chalk.cyan("▶ Initial state:"), input);
  }

  await wf.run();

  if (debugState) {
    const final = wf.state;
    console.info(chalk.green("✅ Final state:"), final);
  }

  console.info(chalk.magenta("=== 🏁 Done ===\n"));
}
