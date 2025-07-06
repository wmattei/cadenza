// describe('LambdaNodeEmitter', () => {
//   it('emits a lambda function', () => {
//     const stack = new Stack();

//     const lambdaNode = new ExecutionNode('taskA', 'lambda' as ExecutionNodeKind, {
//       name: 'taskALambda',
//       description: 'This is Task A',
//       timeout: 30,
//       memorySize: 128,
//       code: "exports.handler = async () => { return 'Hello from Task A'; };",
//     });

//     new LambdaNodeEmitter().emit(stack, lambdaNode);

//     const template = Template.fromStack(stack);

//     template.resourceCountIs('AWS::Lambda::Function', 1);

//     template.hasResourceProperties('AWS::Lambda::Function', {
//       Handler: 'index.handler',
//       Runtime: 'nodejs20.x',
//       FunctionName: 'taskALambda',
//       Description: 'This is Task A',
//       Timeout: 30,
//       MemorySize: 128,
//       Code: {
//         ZipFile: "exports.handler = async () => { return 'Hello from Task A'; };",
//       },
//     });
//   });
// });
