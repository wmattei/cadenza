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

  @lambda()
  async sayFoo(): Promise<string> {
    return '';
  }

  async run(): Promise<void> {
    await this.sayHello(this.state.name);
    await this.sayGoodbye(this.state.name);

    if (1 === 1) {
      await this.sayFoo();
    }
  }
}

// devRun(HelloWorkflow, { name: "World" }, { debugState: true });
