import { CadenzaWorkflow, devRun, lambdaTask } from "@cadenza/core";

export class HelloWorkflow extends CadenzaWorkflow<{ name: string }> {
  @lambdaTask()
  async sayHello(name: string): Promise<string> {
    return `Hello, ${name}!`;
  }

  @lambdaTask()
  async sayGoodbye(name: string): Promise<string> {
    return `Goodbye, ${name}!`;
  }

  async run(): Promise<void> {
    const hello = await this.sayHello(this.state.name);
    const goodbye = await this.sayGoodbye(this.state.name);
    console.info(hello, goodbye);
  }
}

devRun(HelloWorkflow, { name: "World" }, { debugState: true });
