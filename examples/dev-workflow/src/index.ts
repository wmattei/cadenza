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

  @lambda()
  async sayBar(): Promise<string> {
    return '';
  }

  async run(): Promise<void> {
    const bool = await this.sayHello(this.state.name);
    // await this.sayGoodbye(this.state.name);

    if (bool) {
      await this.sayFoo();
      await this.sayGoodbye(this.state.name);
    }

  }
}

// devRun(HelloWorkflow, { name: "World" }, { debugState: true });
