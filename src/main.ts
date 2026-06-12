/**
 * Browser entry point for the Smart Factory Sim application.
 */

import { SmartFactoryApp } from './app';

const root = document.querySelector<HTMLElement>('#app');

if (!root) {
  throw new Error('Application root #app was not found.');
}

const app = new SmartFactoryApp(root);
app.start();

