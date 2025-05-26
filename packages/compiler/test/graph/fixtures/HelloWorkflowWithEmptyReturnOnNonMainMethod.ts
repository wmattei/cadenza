import { CadenzaWorkflow } from '@cadenza/core';

export class HelloWorkflow extends CadenzaWorkflow<{ name: string }> {
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
