import { CadenzaWorkflow, lambda } from '@cadenza/core';

export class EmptyReturnWorkflow extends CadenzaWorkflow<{ name: string }> {
  @lambda()
  sayHello(name: string) {
    return `Hello, ${name}`;
  }

  async run() {
    const hello = await this.sayHello(this.state.name);
    if (hello === 'Hello, World') {
      return;
    }
  }
}

export class EmptyReturnWorkflowOnNonMainMethod extends CadenzaWorkflow<{ name: string }> {
  sayHello(name: string) {
    return `Hello, ${name}`;
  }

  async run() {
    await this.sayHello(this.state.name);
    nonMainMethod();
  }
}

function nonMainMethod() {
  // This method is not the main method and has an empty return.
  return;
}
