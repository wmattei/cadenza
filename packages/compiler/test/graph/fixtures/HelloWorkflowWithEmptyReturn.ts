import { CadenzaWorkflow, lambda } from '@cadenza/core';

export class HelloWorkflow extends CadenzaWorkflow<{ name: string }> {
  @lambda()
  sayHello(name: string) {
    return `Hello, ${name}`;
  }

  async run() {
    const hello = await this.sayHello(this.state.name);
    if (hello === 'Hello, World') {
      return;
    }
  }
}
