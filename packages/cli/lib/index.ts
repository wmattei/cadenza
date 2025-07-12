#!/usr/bin/env node
import { ExecutionGraphBuilder } from '@cadenza/compiler';
import chalk from 'chalk';
import chokidar from 'chokidar';
import Fastify from 'fastify';
import { generateDotGraph } from './dot-utils';
import { resolve } from 'path';

const entryPath = process.argv[2];

if (!entryPath) {
  console.error(chalk.red('❌ You must provide a path to a workflow .ts file'));
  process.exit(1);
}

let dot = '';


const builder = new ExecutionGraphBuilder(resolve(process.cwd(), entryPath));
async function rebuildGraph() {
  try {
    const graph = builder.build();
    dot = generateDotGraph(graph);
    console.log(chalk.gray('🔄 Graph rebuilt'));
  } catch (err) {
    console.error(chalk.red('❌ Failed to build graph:'), err);
  }
}

chokidar.watch(entryPath).on('change', async () => {
  console.log(chalk.yellow(`📁 Detected change in ${entryPath}`));
  await rebuildGraph();
});

const fastify = Fastify();

fastify.get('/graph.dot', async () => dot);

fastify.get('/', async (_, reply) => {
  return reply.type('text/html').send(`
    <html>
  <head>
    <script src="//d3js.org/d3.v7.min.js"></script>
    <script src="https://unpkg.com/@hpcc-js/wasm@2.20.0/dist/graphviz.umd.js"></script>
    <script src="https://unpkg.com/d3-graphviz@5.6.0/build/d3-graphviz.js"></script>
  </head>
  <body>
    <h1>Graph</h1>
    <div id="graph"></div>

    <script>
      async function render() {
        const res = await fetch('/graph.dot');
        const dot = await res.text();
        d3.select("#graph").graphviz()
          .renderDot(dot);
      }

      render();
      setInterval(render, 1000); // Optional: live reload
    </script>
  </body>
</html>
  `);
});

const port = 3000;

(async () => {
  await rebuildGraph();
  await fastify.listen({ port });
  console.log(
    chalk.green(`🚀 Server listening at:`),
    chalk.underline.blue(`http://localhost:${port}`),
  );
})();
