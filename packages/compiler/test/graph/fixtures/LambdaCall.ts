import { CadenzaWorkflow, lambda } from '@cadenza/core';

export class LambdaCallWorkflow extends CadenzaWorkflow<{ name: string }> {
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
    this.sayGoodbye(this.state.name);
  }
}

export class NotImplementedHelloWorkflow extends CadenzaWorkflow<{ name: string }> {
  @lambda()
  sayHello() {}

  @lambda()
  sayGoodbye() {}

  async run() {
    await this.sayHello();
    await this.sayGoodbye();
  }
}
