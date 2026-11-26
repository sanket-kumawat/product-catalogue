import { createApp } from './app.js';
import { createProductRepository } from './composition.js';
import { loadConfig } from './config.js';

const config = loadConfig();
const app = createApp({
  config,
  products: createProductRepository(config),
});

app.listen(config.port, '0.0.0.0', () => {
  console.log(`API listening on http://0.0.0.0:${config.port}`);
});
