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

    new SampleWorkflow();

    const tasks = MetadataRegistry.getTasksForWorkflow(SampleWorkflow.name);

    const tasksArray = Array.from(tasks.values());

    expect(tasksArray.length).toBe(1);
    expect(tasksArray[0].type).toBe('lambda');
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
    new SampleWorkflow();

    const tasks = MetadataRegistry.getTasksForWorkflow(SampleWorkflow.name);

    const tasksArray = Array.from(tasks.values());

    expect(tasksArray.length).toBe(1);
    expect(tasksArray[0].data.description).toBe('Hello world');
    expect(tasksArray[0].data.memorySize).toBe(512);
    expect(tasksArray[0].data.name).toBe('My name');
    expect(tasksArray[0].data.timeout).toBe(1000);
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
    new SampleWorkflow();

    const tasks = MetadataRegistry.getTasksForWorkflow(SampleWorkflow.name);

    const tasksArray = Array.from(tasks.values());

    expect(tasksArray.length).toBe(1);
    expect(tasksArray[0].data.description).toBe('Hello world');
    expect(tasksArray[0].data.memorySize).toBe(512);
    expect(tasksArray[0].data.name).toBe('process');
    expect(tasksArray[0].data.timeout).toBe(1000);
  });
});
