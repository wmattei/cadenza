import { CadenzaWorkflow, lambda } from '@cadenza/core';

export class HelloWorkflow extends CadenzaWorkflow<{ name: string }> {
  @lambda()
  async sayHello(name: string): Promise<string> {
    return `Hello, ${name}!`;
  }

  @lambda()
  async sayGoodbye(name: string): Promise<string> {
    return `Goodbye, ${name}!`;
  }

  async run(): Promise<void> {
    const hello = await this.sayHello(this.state.name);
    const goodbye = await this.sayGoodbye(this.state.name);
    console.info(hello, goodbye);
  }
}

// devRun(HelloWorkflow, { name: "World" }, { debugState: true });
