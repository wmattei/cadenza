import { CadenzaWorkflow, lambda } from '@cadenza/core';

export class HelloWorkflow extends CadenzaWorkflow<{ name: string }> {
  @lambda()
  sayHello(name: string) {
    return `Hello, ${name}`;
  }

  @lambda()
  sayGoodbye(name: string) {
    return `Goodbye, ${name}`;
  }

  async run() {
    await this.sayHello(this.state.name);
    await this.sayGoodbye(this.state.name);
  }
}
