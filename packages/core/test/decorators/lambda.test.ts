import { strictEqual } from 'assert';
import { beforeEach, describe, it } from 'node:test';

import { lambda } from '../../lib/decorators';
import { MetadataRegistry } from '../../lib/metadata';

describe('@lambda decorator', () => {
  beforeEach(() => {
    MetadataRegistry.clear();
  });

  it('should register lambda tasks with metadata', () => {
    class SampleWorkflow {
      @lambda() process() {}
    }

    const tasks = MetadataRegistry.getTasksForWorkflow(SampleWorkflow.name);

    const tasksArray = Array.from(tasks.values());

    strictEqual(tasksArray.length, 1);
    strictEqual(tasksArray[0].kind, 'lambda');
  });
  it('should register lambda metadata with options', () => {
    class SampleWorkflow {
      @lambda({
        description: 'Hello world',
        memorySize: 512,
        name: 'My name',
        timeout: 1000,
      })
      process() {}
    }

    const tasks = MetadataRegistry.getTasksForWorkflow(SampleWorkflow.name);

    const tasksArray = Array.from(tasks.values());

    strictEqual(tasksArray.length, 1);
    strictEqual(tasksArray[0].options.description, 'Hello world');
    strictEqual(tasksArray[0].options.memorySize, 512);
    strictEqual(tasksArray[0].options.name, 'My name');
    strictEqual(tasksArray[0].options.timeout, 1000);
  });
  it('should register lambda metadata with options defaulting to method name', () => {
    class SampleWorkflow {
      @lambda({
        description: 'Hello world',
        memorySize: 512,
        timeout: 1000,
      })
      process() {}
    }

    const tasks = MetadataRegistry.getTasksForWorkflow(SampleWorkflow.name);

    const tasksArray = Array.from(tasks.values());

    strictEqual(tasksArray.length, 1);
    strictEqual(tasksArray[0].options.description, 'Hello world');
    strictEqual(tasksArray[0].options.memorySize, 512);
    strictEqual(tasksArray[0].options.name, 'process');
    strictEqual(tasksArray[0].options.timeout, 1000);
  });
});
