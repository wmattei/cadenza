export abstract class WorkflowBase<TInput = any> {
  public state: TInput = {} as TInput;
  constructor(devInput?: TInput) {
    this.state = devInput || ({} as TInput);
  }

  abstract run(input?: TInput): Promise<void>;

  initialize(state: TInput) {
    this.state = state;
  }
}
