import { CadenzaWorkflow, lambda } from '@cadenza/core';

export class HelloWorkflow extends CadenzaWorkflow<{ name: string }> {
  @lambda({
    description: 'A simple lambda function that greets a user by name',
    memorySize: 128,
    timeout: 5,
  })
  sayHello(name: string) {
    return `Hello, ${name}`;
  }

  async run() {
    await this.sayHello(this.state.name);
  }
}
