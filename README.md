# Cadenza

Cadenza is a TypeScript-first framework for building, deploying, and visualizing AWS Step Functions using an intuitive, annotated class-based syntax — inspired by Airflow and AWS CDK.

## 🎯 Why Cadenza?

Cadenza was born out of the desire to combine:

- The developer ergonomics of Airflow (decorators, single-file workflows)
- The power and visual clarity of Step Functions
- The flexibility of CDK, with real infrastructure as code
- A clean execution model, where every workflow compiles to a graph, emits real AWS resources, and runs locally in development

## 🧱 Philosophy

Cadenza is guided by a few core principles:

- Declarative logic, imperative code
  You write workflows using regular TypeScript classes, but they compile to declarative state machines.
- Minimal friction
  Workflows should be portable, testable, and easy to reason about — no boilerplate or service glue.
- Single-source-of-truth
  The run() method defines the structure. If you can read the method, you understand the workflow.
- Infrastructure-included
  Cadenza doesn’t just define tasks — it builds the Lambda functions, ECS tasks, and Step Function for you.

## Example

```typescript
import { CadenzaWorkflow, lambdaTask } from '@cadenza/core';

class HelloWorkflow extends CadenzaWorkflow<{ name: string }> {
  @lambdaTask()
  sayHello(name: string): string {
    return `Hello, ${name}`;
  }

  @lambdaTask()
  sayGoodbye(name: string): string {
    return `Goodbye, ${name}`;
  }

  async run(): Promise<void> {
    await this.sayHello(this.state.name);
    await this.sayGoodbye(this.state.name);
  }
}
```

All code inside methods annotated with `@lambdaTask` will be compiled into AWS Lambda functions. The `run()` method orchestrates the workflow, and Cadenza handles the rest. That's why you can't (for now) use `this` inside this method as it runs on a total different context.

On the other hand, the code inside the `run()` method is executed locally during development, but in production this will never be executed, instead it will be compiled into a state machine that orchestrates the Lambda functions.

## 🧠 Metaprogramming & Magic: Handle With Care

Cadenza relies heavily on TypeScript decorators and static analysis via ts-morph. That means:
• It reads your source code to infer execution flow
• It introspects decorated methods to bundle code into Lambdas
• It injects dependencies, builds graphs, and emits infrastructure

🧬 This is a form of metaprogramming. It’s powerful — but it introduces some magic. And with magic comes responsibility.

You should:
• Keep your workflow run() method clean and linear
• Avoid indirect control flow (setTimeout, eval, dynamic names)
• Know that what runs locally is not what runs in the cloud — it’s a model of it

## 🧪 What’s Included

• 🧠 Decorators for @lambdaTask, @fargateTask, and more
• 📊 A graph builder that statically analyzes the run() method
• ⚙️ CDK-based emitters that generate a full state machine and its resources
• 🧱 A plugin registry for custom task emitters
• 🧰 Local dev tools to run workflows and simulate state

## 🛠 Project Status

Cadenza is early but fast-moving. Contributions and feedback are welcome.
• Basic task registration
• Graph builder with ts-morph
• CDK-based emitter
• Lambda + Fargate support
• Parallel & branching
• Dev playground UI
• CLI scaffolding & build tooling

## 🤝 License

MIT
