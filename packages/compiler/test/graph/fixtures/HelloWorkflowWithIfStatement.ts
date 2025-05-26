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
    const hello = await this.sayHello(this.state.name);
    if (hello === 'Hello, World') {
      this.sayGoodbye('World');
    } else {
      this.sayGoodbye('Hello');
      console.info(hello, 'This is not the world!');
    }
  }
}
