/**
 * Browser entry point for the Smart Factory Sim application.
 */

import { SmartFactoryApp } from './app';

interface ManagedWindow extends Window {
  __SMART_FACTORY_APP__?: SmartFactoryApp;
}

interface HotImportMeta extends ImportMeta {
  readonly hot?: {
    readonly dispose: (callback: () => void) => void;
  };
}

const existingRoot = document.querySelector<HTMLElement>('#app');

if (!existingRoot) {
  throw new Error('Application root #app was not found.');
}

const managedWindow = window as ManagedWindow;
managedWindow.__SMART_FACTORY_APP__?.dispose();

const root = resetApplicationRoot(existingRoot);
const app = new SmartFactoryApp(root);
managedWindow.__SMART_FACTORY_APP__ = app;
app.start();

const hot = (import.meta as HotImportMeta).hot;
hot?.dispose((): void => {
  app.dispose();
  if (managedWindow.__SMART_FACTORY_APP__ === app) {
    delete managedWindow.__SMART_FACTORY_APP__;
  }
});

function resetApplicationRoot(currentRoot: HTMLElement): HTMLElement {
  const freshRoot = currentRoot.cloneNode(false) as HTMLElement;
  currentRoot.replaceWith(freshRoot);
  return freshRoot;
}
