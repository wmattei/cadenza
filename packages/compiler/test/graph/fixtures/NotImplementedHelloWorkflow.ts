import { CadenzaWorkflow, lambda } from "@cadenza/core";

export class HelloWorkflow extends CadenzaWorkflow<{ name: string }> {
  @lambda()
  sayHello() {}

  @lambda()
  sayGoodbye() {}

  async run() {
    await this.sayHello();
    await this.sayGoodbye();
  }
}
