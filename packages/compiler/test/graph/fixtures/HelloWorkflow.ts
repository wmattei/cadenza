import { CadenzaWorkflow, lambdaTask } from "@cadenza/core";

export class HelloWorkflow extends CadenzaWorkflow<{ name: string }> {
  @lambdaTask()
  sayHello(name: string) {
    return `Hello, ${name}`;
  }

  @lambdaTask()
  sayGoodbye(name: string) {
    return `Goodbye, ${name}`;
  }

  async run() {
    await this.sayHello(this.state.name);
    await this.sayGoodbye(this.state.name);
  }
}
